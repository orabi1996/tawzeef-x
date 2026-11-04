-- Company tasks are changed only through the authenticated workflow gateway.
-- Existing personal rows retain their original read access until their owner explicitly imports them.
CREATE SCHEMA task_private;
REVOKE ALL ON SCHEMA task_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA task_private TO authenticated;
ALTER TABLE public.tasks
 ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
 ADD COLUMN assignee_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 ADD COLUMN reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 ADD COLUMN expected_outcome text NOT NULL DEFAULT '',
 ADD COLUMN completion_note text NOT NULL DEFAULT '',
 ADD COLUMN blocked_reason text NOT NULL DEFAULT '',
 ADD COLUMN cycle_id uuid REFERENCES evaluation_private.cycles(id) ON DELETE SET NULL,
 ADD COLUMN archived_at timestamptz,
 ADD COLUMN completed_at timestamptz,
 ADD COLUMN version integer NOT NULL DEFAULT 1,
 ADD COLUMN events jsonb NOT NULL DEFAULT '[]';
CREATE INDEX tasks_company_updated ON public.tasks(company_id,updated_at DESC);
CREATE INDEX tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX tasks_reviewer_id ON public.tasks(reviewer_id);
CREATE INDEX tasks_cycle_id ON public.tasks(cycle_id);
REVOKE INSERT,UPDATE,DELETE ON public.tasks FROM PUBLIC,anon,authenticated;
DROP POLICY "Users can manage their own tasks" ON public.tasks;
CREATE POLICY "Read own unimported personal tasks" ON public.tasks FOR SELECT TO authenticated
 USING(company_id IS NULL AND user_id=auth.uid());

CREATE FUNCTION task_private.request(_company_id uuid,_action text,_payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE
 actor uuid:=auth.uid(); admin_access boolean; owner_access boolean; actor_name text;
 t public.tasks%ROWTYPE; task_id uuid; who uuid; reviewer uuid; job uuid; candidate uuid; cycle uuid;
 rows_json jsonb; people jsonb; cycles_json jsonb; jobs_json jsonb; candidates_json jsonb; legacy jsonb;
 next_status text; reason text; note text; checklist jsonb; entry jsonb;
BEGIN
 IF actor IS NULL OR NOT EXISTS(SELECT 1 FROM auth.users WHERE id=actor AND deleted_at IS NULL AND (banned_until IS NULL OR banned_until<=clock_timestamp()))
   OR NOT EXISTS(SELECT 1 FROM public.company_members m JOIN public.companies c ON c.id=m.company_id WHERE m.user_id=actor AND m.company_id=_company_id AND c.status='active')
 THEN RAISE EXCEPTION 'Active company membership required' USING ERRCODE='42501'; END IF;
 IF _payload IS NULL OR jsonb_typeof(_payload)<>'object' THEN RAISE EXCEPTION 'Invalid request'; END IF;
 SELECT EXISTS(SELECT 1 FROM public.company_members WHERE company_id=_company_id AND user_id=actor AND member_role IN ('owner','admin','hr')) INTO admin_access;
 SELECT coalesce(nullif(full_name,''),'Team member') INTO actor_name FROM public.profiles WHERE user_id=actor;
 actor_name:=coalesce(actor_name,'Team member');
 IF _action='list' THEN
   SELECT coalesce(jsonb_agg(to_jsonb(q) ORDER BY q.updated_at DESC),'[]') INTO rows_json FROM (
     SELECT x.*,coalesce(p.full_name,x.assignee) AS assignee_name,r.full_name AS reviewer_name
     FROM public.tasks x LEFT JOIN public.profiles p ON p.user_id=x.assignee_id LEFT JOIN public.profiles r ON r.user_id=x.reviewer_id
     WHERE x.company_id=_company_id AND (admin_access OR actor IN (x.user_id,x.assignee_id,x.reviewer_id))
     AND (x.archived_at IS NOT NULL)=coalesce((_payload->>'archived')::boolean,false)
     ORDER BY x.updated_at DESC LIMIT 500
   ) q;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',m.user_id,'name',coalesce(nullif(p.full_name,''),'Team member')) ORDER BY p.full_name),'[]') INTO people
   FROM public.company_members m JOIN auth.users u ON u.id=m.user_id LEFT JOIN public.profiles p ON p.user_id=m.user_id
   WHERE m.company_id=_company_id AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp());
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'subject_id',subject_id)),'[]') INTO cycles_json
   FROM evaluation_private.cycles WHERE company_id=_company_id AND status='closed' AND (admin_access OR subject_id=actor);
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title)),'[]') INTO jobs_json FROM public.jobs WHERE company_id=_company_id AND admin_access;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',q.id,'name',q.name)),'[]') INTO candidates_json FROM (SELECT id,name FROM public.candidates WHERE company_id=_company_id AND admin_access ORDER BY created_at DESC LIMIT 500) q;
   SELECT coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'description',description,'due_date',due_date)),'[]') INTO legacy FROM public.tasks WHERE company_id IS NULL AND user_id=actor;
   RETURN jsonb_build_object('tasks',rows_json,'members',people,'cycles',cycles_json,'jobs',jobs_json,'candidates',candidates_json,'legacy',legacy,'can_manage',admin_access);
 END IF;
 IF _action NOT IN ('create','import') THEN
   SELECT * INTO t FROM public.tasks WHERE id=(_payload->>'id')::uuid AND company_id=_company_id FOR UPDATE;
   IF NOT FOUND OR NOT (admin_access OR coalesce(actor IN (t.user_id,t.assignee_id,t.reviewer_id),false)) THEN RAISE EXCEPTION 'Task unavailable' USING ERRCODE='42501'; END IF;
   IF (_payload->>'version')::integer IS DISTINCT FROM t.version THEN RAISE EXCEPTION 'TASK_CONFLICT: refresh before saving' USING ERRCODE='40001'; END IF;
   IF t.archived_at IS NOT NULL AND _action<>'restore' THEN RAISE EXCEPTION 'Restore archived task first'; END IF;
 END IF;
 owner_access:=admin_access OR actor=t.user_id;
 IF _action IN ('create','edit','import') THEN
   IF _action='edit' AND (NOT owner_access OR t.column_status IN ('in_review','done')) THEN RAISE EXCEPTION 'Only task owner or administrator can edit before review' USING ERRCODE='42501'; END IF;
   who:=(_payload->>'assignee_id')::uuid; reviewer:=nullif(_payload->>'reviewer_id','')::uuid;
   job:=nullif(_payload->>'job_id','')::uuid; candidate:=nullif(_payload->>'candidate_id','')::uuid;cycle:=nullif(_payload->>'cycle_id','')::uuid;
   IF who IS NULL OR NOT EXISTS(SELECT 1 FROM public.company_members m JOIN auth.users u ON u.id=m.user_id WHERE m.company_id=_company_id AND m.user_id=who AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())) THEN RAISE EXCEPTION 'Choose an active company assignee'; END IF;
   IF NOT admin_access AND who<>actor THEN RAISE EXCEPTION 'Only company administrators assign work to other members' USING ERRCODE='42501'; END IF;
   IF reviewer IS NOT NULL AND (reviewer=who OR NOT EXISTS(SELECT 1 FROM public.company_members m JOIN auth.users u ON u.id=m.user_id WHERE m.company_id=_company_id AND m.user_id=reviewer AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp()))) THEN RAISE EXCEPTION 'Choose a different active company reviewer'; END IF;
   IF NOT admin_access AND (job IS NOT NULL OR candidate IS NOT NULL) THEN RAISE EXCEPTION 'Company administrator required for recruitment links' USING ERRCODE='42501'; END IF;
   IF job IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.jobs WHERE id=job AND company_id=_company_id) THEN RAISE EXCEPTION 'Job outside company'; END IF;
   IF candidate IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.candidates WHERE id=candidate AND company_id=_company_id) THEN RAISE EXCEPTION 'Candidate outside company'; END IF;
   IF cycle IS NOT NULL AND NOT EXISTS(SELECT 1 FROM evaluation_private.cycles WHERE id=cycle AND company_id=_company_id AND status='closed' AND (admin_access OR subject_id=actor)) THEN RAISE EXCEPTION 'Closed cycle unavailable'; END IF;
   IF length(btrim(coalesce(_payload->>'title',''))) NOT BETWEEN 1 AND 160 OR length(coalesce(_payload->>'description',''))>4000 OR length(btrim(coalesce(_payload->>'expected_outcome',''))) NOT BETWEEN 1 AND 2000
    OR (_payload->>'due_date')::date IS NULL OR coalesce(_payload->>'priority','') NOT IN ('high','medium','low') THEN RAISE EXCEPTION 'Complete title, outcome, due date and priority'; END IF;
   IF _action='create' THEN
     INSERT INTO public.tasks(company_id,user_id,title,description,assignee,assignee_id,reviewer_id,due_date,priority,column_status,expected_outcome,job_id,candidate_id,cycle_id)
     VALUES(_company_id,actor,btrim(_payload->>'title'),_payload->>'description',coalesce((SELECT full_name FROM public.profiles WHERE user_id=who),'Team member'),who,reviewer,(_payload->>'due_date')::date,_payload->>'priority','todo',btrim(_payload->>'expected_outcome'),job,candidate,cycle) RETURNING * INTO t;
   ELSE
     IF _action='import' THEN
       SELECT * INTO t FROM public.tasks WHERE id=(_payload->>'id')::uuid AND company_id IS NULL AND user_id=actor FOR UPDATE;
       IF NOT FOUND THEN RAISE EXCEPTION 'Personal task unavailable'; END IF;
     END IF;
     UPDATE public.tasks SET company_id=_company_id,title=btrim(_payload->>'title'),description=_payload->>'description',assignee_id=who,reviewer_id=reviewer,
       assignee=coalesce((SELECT full_name FROM public.profiles WHERE user_id=who),'Team member'),due_date=(_payload->>'due_date')::date,priority=_payload->>'priority',
       expected_outcome=btrim(_payload->>'expected_outcome'),job_id=job,candidate_id=candidate,cycle_id=cycle,
       column_status=CASE WHEN _action='import' THEN 'todo' ELSE column_status END WHERE id=t.id;
   END IF;
 ELSIF _action='work' THEN
   IF actor IS DISTINCT FROM t.assignee_id OR t.column_status NOT IN ('todo','in_progress') THEN RAISE EXCEPTION 'Only assignee may update work before review' USING ERRCODE='42501'; END IF;
   checklist:=_payload->'subtasks';
   IF checklist IS NULL OR jsonb_typeof(checklist)<>'array' OR jsonb_array_length(checklist)>50 THEN RAISE EXCEPTION 'Invalid checklist'; END IF;
   FOR entry IN SELECT * FROM jsonb_array_elements(checklist) LOOP
     IF jsonb_typeof(entry)<>'object' OR length(btrim(coalesce(entry->>'title',''))) NOT BETWEEN 1 AND 300 OR coalesce(entry->>'id','') !~ '^[a-zA-Z0-9_-]{1,80}$' OR jsonb_typeof(entry->'completed') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'Invalid checklist entry'; END IF;
   END LOOP;
   IF (SELECT count(DISTINCT x->>'id') FROM jsonb_array_elements(checklist) x)<>jsonb_array_length(checklist) THEN RAISE EXCEPTION 'Duplicate checklist identifiers'; END IF;
   IF length(coalesce(_payload->>'completion_note',''))>4000 OR length(coalesce(_payload->>'blocked_reason',''))>1000 THEN RAISE EXCEPTION 'Work note too long'; END IF;
   UPDATE public.tasks SET subtasks=checklist,completion_note=btrim(coalesce(_payload->>'completion_note','')),blocked_reason=btrim(coalesce(_payload->>'blocked_reason','')) WHERE id=t.id;
 ELSIF _action='transition' THEN
   next_status:=_payload->>'status';reason:=btrim(coalesce(_payload->>'reason',''));
   IF next_status IS NULL OR length(reason)>2000 THEN RAISE EXCEPTION 'Invalid transition'; END IF;
   IF t.column_status='done' AND next_status='todo' THEN
     IF NOT owner_access OR reason='' THEN RAISE EXCEPTION 'Owner and reopening reason required'; END IF;
   ELSIF t.column_status='in_review' AND next_status='todo' THEN
     IF NOT owner_access OR reason='' THEN RAISE EXCEPTION 'Owner and recall reason required'; END IF;
   ELSIF t.column_status='in_review' AND next_status IN ('done','in_progress') THEN
     IF actor IS DISTINCT FROM t.reviewer_id THEN RAISE EXCEPTION 'Assigned reviewer required' USING ERRCODE='42501'; END IF;
     IF next_status='in_progress' AND reason='' THEN RAISE EXCEPTION 'Revision reason required'; END IF;
   ELSIF (t.column_status='backlog' AND next_status='todo') OR (t.column_status='todo' AND next_status IN ('backlog','in_progress')) OR (t.column_status='in_progress' AND next_status IN ('todo','in_review','done')) THEN
     IF actor IS DISTINCT FROM t.assignee_id THEN RAISE EXCEPTION 'Assigned worker required' USING ERRCODE='42501'; END IF;
     IF next_status='in_review' AND t.reviewer_id IS NULL THEN RAISE EXCEPTION 'No reviewer assigned'; END IF;
     IF next_status='done' AND t.reviewer_id IS NOT NULL THEN RAISE EXCEPTION 'Reviewer approval required'; END IF;
   ELSE RAISE EXCEPTION 'Invalid workflow transition'; END IF;
   IF next_status IN ('in_review','done') THEN
     IF btrim(t.completion_note)='' OR btrim(t.blocked_reason)<>'' OR EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(t.subtasks,'[]')) x WHERE (x->>'completed')::boolean IS DISTINCT FROM true) THEN RAISE EXCEPTION 'Add result, complete checklist and resolve blocker before submission'; END IF;
     IF t.assignee_id IS NULL OR NOT EXISTS(SELECT 1 FROM public.company_members m JOIN auth.users u ON u.id=m.user_id WHERE m.company_id=_company_id AND m.user_id=t.assignee_id AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())) THEN RAISE EXCEPTION 'Assignee no longer active'; END IF;
     IF next_status='in_review' AND NOT EXISTS(SELECT 1 FROM public.company_members m JOIN auth.users u ON u.id=m.user_id WHERE m.company_id=_company_id AND m.user_id=t.reviewer_id AND u.deleted_at IS NULL AND (u.banned_until IS NULL OR u.banned_until<=clock_timestamp())) THEN RAISE EXCEPTION 'Reviewer no longer active'; END IF;
   END IF;
   UPDATE public.tasks SET column_status=next_status,completed_at=CASE WHEN next_status='done' THEN clock_timestamp() ELSE NULL END,
     completion_note=CASE WHEN t.column_status='done' THEN '' ELSE completion_note END WHERE id=t.id;
 ELSIF _action IN ('archive','restore') THEN
   IF NOT owner_access THEN RAISE EXCEPTION 'Task owner or administrator required' USING ERRCODE='42501'; END IF;
   UPDATE public.tasks SET archived_at=CASE WHEN _action='archive' THEN clock_timestamp() ELSE NULL END WHERE id=t.id;
 ELSIF _action='comment' THEN
   note:=btrim(coalesce(_payload->>'text',''));
   IF length(note) NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Comment must contain 1 to 2000 characters'; END IF;
 ELSE RAISE EXCEPTION 'Unsupported task action'; END IF;
 UPDATE public.tasks SET version=version+1,events=events||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'action',_action,'actor_id',actor,'actor_name',actor_name,'at',clock_timestamp(),'from',t.column_status,'to',next_status,'text',coalesce(note,reason,''))) WHERE id=t.id;
 RETURN jsonb_build_object('id',t.id);
END;
$$;
REVOKE ALL ON FUNCTION task_private.request(uuid,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION task_private.request(uuid,text,jsonb) TO authenticated;
CREATE FUNCTION public.task_workflow(_company_id uuid,_action text,_payload jsonb DEFAULT '{}') RETURNS jsonb
LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ SELECT task_private.request(_company_id,_action,_payload); $$;
REVOKE ALL ON FUNCTION public.task_workflow(uuid,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.task_workflow(uuid,text,jsonb) TO authenticated;
