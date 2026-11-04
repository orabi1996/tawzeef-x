ALTER TABLE evaluation_private.cycles ADD COLUMN version integer NOT NULL DEFAULT 1;
CREATE OR REPLACE FUNCTION evaluation_private.request_impl(_company_id uuid, _action text, _payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
 actor uuid := auth.uid(); admin_access boolean; c evaluation_private.cycles%ROWTYPE;
 a evaluation_private.assignments%ROWTYPE; v_cycle_id uuid; target uuid; relation text;
 item jsonb; value jsonb; rubric jsonb; rows_json jsonb; participants_json jsonb; tasks_json jsonb;
 results_json jsonb; group_json jsonb; criteria_json jsonb := '[]';
 category text; n integer; expected integer; eligible integer;
 grade numeric; external_total numeric; external_groups integer;
 weighted_total numeric := 0; available_weight numeric := 0; criterion_weight numeric;
BEGIN
 IF actor IS NULL OR NOT EXISTS (
   SELECT 1 FROM public.company_members m JOIN public.companies co ON co.id=m.company_id
   WHERE m.company_id=_company_id AND m.user_id=actor AND co.status='active'
 ) THEN RAISE EXCEPTION 'Company membership required' USING ERRCODE='42501'; END IF;
 IF _payload IS NULL OR jsonb_typeof(_payload)<>'object' THEN RAISE EXCEPTION 'Invalid request'; END IF;
 SELECT EXISTS(SELECT 1 FROM public.company_members WHERE company_id=_company_id AND user_id=actor
   AND member_role IN ('owner','admin','hr')) INTO admin_access;

 IF _action='list' THEN
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',x.id,'title',x.title,'subject_id',x.subject_id,
     'subject_name',coalesce(p.full_name,'—'),'period_start',x.period_start,'period_end',x.period_end,
     'deadline',x.deadline,'status',x.status,'criteria',x.criteria,'is_subject',x.subject_id=actor,
     'created_at',x.created_at,'version',x.version) ORDER BY x.created_at DESC),'[]') INTO rows_json
   FROM evaluation_private.cycles x LEFT JOIN public.profiles p ON p.user_id=x.subject_id
   WHERE x.company_id=_company_id AND (admin_access OR x.subject_id=actor OR (x.status<>'draft' AND EXISTS(
     SELECT 1 FROM evaluation_private.assignments t WHERE t.cycle_id=x.id AND t.reviewer_id=actor)));
   -- Only own assignment IDs and completion state are disclosed to raters.
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',t.id,'cycle_id',t.cycle_id,'relationship',t.relationship,
     'submitted',EXISTS(SELECT 1 FROM evaluation_private.responses r WHERE r.assignment_id=t.id))),'[]') INTO tasks_json
   FROM evaluation_private.assignments t JOIN evaluation_private.cycles x ON x.id=t.cycle_id
   WHERE x.company_id=_company_id AND x.status<>'draft' AND t.reviewer_id=actor;
   IF admin_access THEN
     SELECT coalesce(jsonb_agg(jsonb_build_object('user_id',m.user_id,'name',coalesce(p.full_name,'—')) ORDER BY p.full_name),'[]')
       INTO participants_json FROM public.company_members m JOIN auth.users u ON u.id=m.user_id
       LEFT JOIN public.profiles p ON p.user_id=m.user_id WHERE m.company_id=_company_id AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp());
   END IF;
   RETURN jsonb_build_object('can_manage',admin_access,'cycles',rows_json,'tasks',tasks_json,'members',coalesce(participants_json,'[]'));
 END IF;

 IF _action IN ('create','edit') THEN
   IF NOT admin_access THEN RAISE EXCEPTION 'Cycle administrator required' USING ERRCODE='42501'; END IF;
   target := (_payload->>'subject_id')::uuid;
   IF _action='edit' THEN
     SELECT * INTO c FROM evaluation_private.cycles WHERE id=(_payload->>'cycle_id')::uuid AND company_id=_company_id FOR UPDATE;
     IF NOT FOUND OR c.status<>'draft' THEN RAISE EXCEPTION 'Only a draft may be edited'; END IF;
     IF c.version IS DISTINCT FROM (_payload->>'version')::integer THEN RAISE EXCEPTION 'CYCLE_CONFLICT: refresh before saving' USING ERRCODE='40001'; END IF;
     IF target IS DISTINCT FROM c.subject_id THEN RAISE EXCEPTION 'Review subject cannot change'; END IF;
   END IF;
   IF NOT EXISTS(SELECT 1 FROM public.company_members WHERE company_id=_company_id AND user_id=target) THEN
     RAISE EXCEPTION 'Subject must belong to this company'; END IF;
   rubric := _payload->'criteria';
   IF rubric IS NULL OR jsonb_typeof(rubric)<>'array' THEN RAISE EXCEPTION 'Invalid criteria'; END IF;
   IF jsonb_array_length(rubric) NOT BETWEEN 3 AND 10 THEN RAISE EXCEPTION 'Use three to ten criteria'; END IF;
   FOR item IN SELECT * FROM jsonb_array_elements(rubric) LOOP
     IF jsonb_typeof(item)<>'object' OR coalesce(item->>'id','') !~ '^[a-z][a-z0-9_]{0,39}$'
       OR length(btrim(coalesce(item->>'title',''))) NOT BETWEEN 1 AND 120
       OR length(btrim(coalesce(item->>'description',''))) NOT BETWEEN 1 AND 600
       OR jsonb_typeof(item->'weight') IS DISTINCT FROM 'number' THEN RAISE EXCEPTION 'Invalid criterion'; END IF;
     criterion_weight := (item->>'weight')::numeric;
     IF criterion_weight NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid criterion weight'; END IF;
     weighted_total := weighted_total+criterion_weight;
   END LOOP;
   IF weighted_total<>100 OR (SELECT count(DISTINCT v->>'id') FROM jsonb_array_elements(rubric) v)<>jsonb_array_length(rubric) THEN
     RAISE EXCEPTION 'Criteria require unique IDs and weights totaling 100'; END IF;
   IF (_payload->>'deadline')::timestamptz IS NULL OR (_payload->>'deadline')::timestamptz<=clock_timestamp() THEN
     RAISE EXCEPTION 'Deadline must be in the future'; END IF;
   IF _action='edit' THEN
     UPDATE evaluation_private.cycles SET title=btrim(_payload->>'title'),period_start=(_payload->>'period_start')::date,period_end=(_payload->>'period_end')::date,deadline=(_payload->>'deadline')::timestamptz,criteria=rubric,version=version+1 WHERE id=c.id;
     RETURN jsonb_build_object('id',c.id);
   END IF;
   INSERT INTO evaluation_private.cycles(company_id,subject_id,title,period_start,period_end,deadline,criteria,created_by)
   VALUES(_company_id,target,btrim(_payload->>'title'),(_payload->>'period_start')::date,(_payload->>'period_end')::date,
     (_payload->>'deadline')::timestamptz,rubric,actor) RETURNING id INTO v_cycle_id;
   INSERT INTO evaluation_private.assignments(cycle_id,reviewer_id,relationship) VALUES(v_cycle_id,target,'self');
   RETURN jsonb_build_object('id',v_cycle_id);
 END IF;

 v_cycle_id := (_payload->>'cycle_id')::uuid;
 -- All mutations lock the same cycle first: close cannot race a submission.
 SELECT * INTO c FROM evaluation_private.cycles WHERE id=v_cycle_id AND company_id=_company_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Cycle unavailable' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.company_members WHERE company_id=_company_id AND user_id=c.subject_id) THEN
   RAISE EXCEPTION 'Subject is no longer a company member' USING ERRCODE='42501'; END IF;

 IF _action='roster' THEN
   IF NOT admin_access THEN RAISE EXCEPTION 'Cycle administrator required' USING ERRCODE='42501'; END IF;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',t.id,'reviewer_id',t.reviewer_id,'name',coalesce(p.full_name,'—'),
     'relationship',t.relationship) ORDER BY t.relationship,p.full_name),'[]') INTO participants_json
   FROM evaluation_private.assignments t LEFT JOIN public.profiles p ON p.user_id=t.reviewer_id WHERE t.cycle_id=c.id;
   -- No per-person submission state or timestamp: prevents timing-based correlation.
   RETURN participants_json;
 ELSIF _action IN ('assign','remove') THEN
   IF NOT admin_access THEN RAISE EXCEPTION 'Cycle administrator required' USING ERRCODE='42501'; END IF;
   IF c.status<>'draft' THEN RAISE EXCEPTION 'Participants are frozen after opening'; END IF;
   target := (_payload->>'reviewer_id')::uuid;
   IF target=c.subject_id THEN RAISE EXCEPTION 'Self assignment is fixed'; END IF;
   IF _action='remove' THEN
     DELETE FROM evaluation_private.assignments WHERE cycle_id=c.id AND reviewer_id=target;
   ELSE
     relation := _payload->>'relationship';
     IF relation IS NULL OR relation NOT IN ('manager','peers','subordinates') THEN RAISE EXCEPTION 'Invalid relationship'; END IF;
     IF NOT EXISTS(SELECT 1 FROM public.company_members WHERE company_id=_company_id AND user_id=target) THEN
       RAISE EXCEPTION 'Reviewer must belong to this company'; END IF;
     INSERT INTO evaluation_private.assignments(cycle_id,reviewer_id,relationship) VALUES(c.id,target,relation);
   END IF;
   RETURN jsonb_build_object('ok',true);
 ELSIF _action='open' THEN
   IF NOT admin_access THEN RAISE EXCEPTION 'Cycle administrator required' USING ERRCODE='42501'; END IF;
   IF c.status<>'draft' OR c.deadline<=clock_timestamp() THEN RAISE EXCEPTION 'Cycle cannot be opened'; END IF;
   IF EXISTS(SELECT 1 FROM evaluation_private.assignments t WHERE t.cycle_id=c.id AND NOT EXISTS(
     SELECT 1 FROM public.company_members m JOIN auth.users u ON u.id=m.user_id WHERE m.company_id=_company_id AND m.user_id=t.reviewer_id AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp()))) THEN
     RAISE EXCEPTION 'A participant left this company'; END IF;
   IF NOT EXISTS(SELECT 1 FROM evaluation_private.assignments WHERE cycle_id=c.id AND relationship<>'self') THEN
     RAISE EXCEPTION 'At least one external reviewer is required'; END IF;
   IF EXISTS(SELECT 1 FROM evaluation_private.assignments WHERE cycle_id=c.id AND relationship IN ('peers','subordinates')
     GROUP BY relationship HAVING count(*)<3) THEN RAISE EXCEPTION 'Confidential groups require at least three participants'; END IF;
   UPDATE evaluation_private.cycles SET status='open',opened_at=clock_timestamp() WHERE id=c.id;
   RETURN jsonb_build_object('ok',true);
 ELSIF _action='submit' THEN
   IF c.status<>'open' OR c.deadline<=clock_timestamp() THEN RAISE EXCEPTION 'Submission window closed'; END IF;
   SELECT * INTO a FROM evaluation_private.assignments WHERE cycle_id=c.id AND reviewer_id=actor
     AND id=(_payload->>'assignment_id')::uuid;
   IF NOT FOUND THEN RAISE EXCEPTION 'This review is not assigned to you' USING ERRCODE='42501'; END IF;
   rubric:=_payload->'scores';
   IF rubric IS NULL OR jsonb_typeof(rubric)<>'object' THEN RAISE EXCEPTION 'Invalid scores'; END IF;
   IF (SELECT count(*) FROM jsonb_object_keys(rubric))<>jsonb_array_length(c.criteria) THEN RAISE EXCEPTION 'All criteria must be answered or marked not observed'; END IF;
   FOR item IN SELECT * FROM jsonb_array_elements(c.criteria) LOOP
     IF NOT rubric ? (item->>'id') THEN RAISE EXCEPTION 'Missing criterion'; END IF;
     value:=rubric->(item->>'id');
     IF value<>'null'::jsonb THEN
       IF jsonb_typeof(value)<>'number' THEN RAISE EXCEPTION 'Scores must be numbers'; END IF;
       grade:=(value#>>'{}')::numeric;
       IF grade NOT BETWEEN 1 AND 5 OR grade<>trunc(grade) THEN RAISE EXCEPTION 'Scores must be integers from one to five'; END IF;
     END IF;
   END LOOP;
   -- Unique assignment_id makes double submission impossible. No update endpoint.
   INSERT INTO evaluation_private.responses(assignment_id,scores) VALUES(a.id,rubric);
   RETURN jsonb_build_object('ok',true);
 ELSIF _action='close' THEN
   IF NOT admin_access THEN RAISE EXCEPTION 'Cycle administrator required' USING ERRCODE='42501'; END IF;
   IF c.status<>'open' THEN RAISE EXCEPTION 'Only an open cycle can be closed'; END IF;
   -- Results become visible once, as an immutable snapshot. Never offer live partial totals.
   group_json:='{}';
   FOREACH category IN ARRAY ARRAY['self','manager','peers','subordinates'] LOOP
     SELECT count(*),count(r.assignment_id) INTO expected,n FROM evaluation_private.assignments t
       LEFT JOIN evaluation_private.responses r ON r.assignment_id=t.id WHERE t.cycle_id=c.id AND t.relationship=category;
     group_json:=group_json||jsonb_build_object(category,jsonb_build_object('assigned',expected,'submitted',n));
   END LOOP;
   FOR item IN SELECT * FROM jsonb_array_elements(c.criteria) LOOP
     results_json:='{}'; external_total:=0; external_groups:=0;
     FOREACH category IN ARRAY ARRAY['self','manager','peers','subordinates'] LOOP
       SELECT count(*),avg((r.scores->>(item->>'id'))::numeric) INTO eligible,grade
       FROM evaluation_private.assignments t JOIN evaluation_private.responses r ON r.assignment_id=t.id
       WHERE t.cycle_id=c.id AND t.relationship=category AND r.scores->(item->>'id')<>'null'::jsonb
         AND EXISTS(SELECT 1 FROM public.company_members m WHERE m.company_id=_company_id AND m.user_id=t.reviewer_id);
       IF category IN ('peers','subordinates') AND eligible<3 THEN grade:=NULL; END IF;
       results_json:=results_json||jsonb_build_object(category,grade);
       IF category<>'self' AND grade IS NOT NULL THEN external_total:=external_total+grade; external_groups:=external_groups+1; END IF;
     END LOOP;
     grade:=CASE WHEN external_groups>0 THEN external_total/external_groups ELSE NULL END;
     criterion_weight:=(item->>'weight')::numeric;
     IF grade IS NOT NULL THEN weighted_total:=weighted_total+grade*criterion_weight; available_weight:=available_weight+criterion_weight; END IF;
     criteria_json:=criteria_json||jsonb_build_array(jsonb_build_object('id',item->>'id','title',item->>'title',
       'weight',criterion_weight,'groups',results_json,'external',grade));
   END LOOP;
   results_json:=jsonb_build_object('criteria',criteria_json,'groups',group_json,'available_weight',available_weight,
     'overall',CASE WHEN available_weight>0 THEN weighted_total/available_weight ELSE NULL END,'closed_at',clock_timestamp());
   UPDATE evaluation_private.cycles SET status='closed',closed_at=clock_timestamp(),result=results_json WHERE id=c.id;
   RETURN jsonb_build_object('ok',true);
 ELSIF _action='report' THEN
   IF NOT admin_access AND c.subject_id<>actor THEN RAISE EXCEPTION 'Report access denied' USING ERRCODE='42501'; END IF;
   IF c.status<>'closed' THEN RAISE EXCEPTION 'Results are available after closing'; END IF;
   RETURN c.result;
 END IF;
 RAISE EXCEPTION 'Unsupported cycle operation';
END;
$$;

REVOKE ALL ON FUNCTION evaluation_private.request_impl(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
