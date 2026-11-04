-- Disposable migration-replay database only. Synthetic fixtures are rolled back.
BEGIN;
SET LOCAL session_replication_role=replica;
INSERT INTO auth.users(id,email,raw_user_meta_data) SELECT ('47000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid,'workflow-'||i||'@example.test','{}' FROM generate_series(1,5)i;
INSERT INTO public.companies(id,name,owner_user_id,status) VALUES
 ('47100000-0000-0000-0000-000000000001','Workflow A','47000000-0000-0000-0000-000000000001','active'),
 ('47100000-0000-0000-0000-000000000002','Workflow B','47000000-0000-0000-0000-000000000004','active');
INSERT INTO public.company_members(company_id,user_id,member_role) SELECT
 CASE WHEN i=4 THEN '47100000-0000-0000-0000-000000000002'::uuid ELSE '47100000-0000-0000-0000-000000000001'::uuid END,
 ('47000000-0000-0000-0000-'||lpad(i::text,12,'0'))::uuid,CASE WHEN i IN (1,4) THEN 'owner' ELSE 'viewer' END FROM generate_series(1,5)i;
INSERT INTO public.jobs(id,user_id,company_id,title,department,location,type) VALUES
 ('47200000-0000-0000-0000-000000000001','47000000-0000-0000-0000-000000000004','47100000-0000-0000-0000-000000000002','Other job','Test','Test','full-time');
INSERT INTO public.candidates(id,user_id,company_id,name,email) VALUES
 ('47300000-0000-0000-0000-000000000001','47000000-0000-0000-0000-000000000004','47100000-0000-0000-0000-000000000002','Other candidate','workflow-candidate@example.test');
INSERT INTO public.tasks(id,title,assignee,due_date,user_id) VALUES
 ('47400000-0000-0000-0000-000000000001','Legacy personal','Unverified name',current_date,'47000000-0000-0000-0000-000000000001');
INSERT INTO evaluation_private.cycles(id,company_id,subject_id,title,period_start,period_end,deadline,criteria,created_by,status) VALUES
 ('47500000-0000-0000-0000-000000000001','47100000-0000-0000-0000-000000000001','47000000-0000-0000-0000-000000000002','Closed development review',current_date-30,current_date,now()+interval '7 days','[{"id":"one","title":"One","description":"Behavior","weight":100}]','47000000-0000-0000-0000-000000000001','closed'),
 ('47500000-0000-0000-0000-000000000002','47100000-0000-0000-0000-000000000002','47000000-0000-0000-0000-000000000004','Foreign review',current_date-30,current_date,now()+interval '7 days','[{"id":"one","title":"One","description":"Behavior","weight":100}]','47000000-0000-0000-0000-000000000004','closed'),
 ('47500000-0000-0000-0000-000000000003','47100000-0000-0000-0000-000000000001','47000000-0000-0000-0000-000000000002','Unreleased review',current_date-30,current_date,now()+interval '7 days','[{"id":"one","title":"One","description":"Behavior","weight":100}]','47000000-0000-0000-0000-000000000001','draft');
SET LOCAL session_replication_role=origin;
CREATE FUNCTION pg_temp.expect(ok boolean,msg text) RETURNS void LANGUAGE plpgsql AS $$BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'Task workflow test: %',msg; END IF; END$$;
CREATE FUNCTION pg_temp.denied(co uuid,op text,p jsonb) RETURNS boolean LANGUAGE plpgsql AS $$BEGIN PERFORM public.task_workflow(co,op,p);RETURN false;EXCEPTION WHEN OTHERS THEN RETURN true;END$$;
CREATE FUNCTION pg_temp.task(co uuid,id uuid) RETURNS jsonb LANGUAGE sql AS $$SELECT x FROM jsonb_array_elements(public.task_workflow(co,'list','{}')->'tasks') x WHERE x->>'id'=id::text$$;
CREATE FUNCTION pg_temp.mutate(co uuid,id uuid,op text,p jsonb) RETURNS jsonb LANGUAGE sql AS $$SELECT public.task_workflow(co,op,p||jsonb_build_object('id',id,'version',(pg_temp.task(co,id)->>'version')::integer))$$;
DO $$
DECLARE co uuid:='47100000-0000-0000-0000-000000000001'; id uuid; own_id uuid; p jsonb; r jsonb; v integer; c uuid; spec jsonb;
BEGIN
 PERFORM pg_temp.expect(NOT has_table_privilege('authenticated','public.tasks','UPDATE'),'direct status bypass');
 PERFORM pg_temp.expect(NOT has_table_privilege('authenticated','public.tasks','INSERT'),'direct creation bypass');
 PERFORM pg_temp.expect(NOT has_table_privilege('authenticated','public.tasks','DELETE'),'permanent delete bypass');
 PERFORM pg_temp.expect(NOT has_function_privilege('anon','public.task_workflow(uuid,text,jsonb)','EXECUTE'),'anonymous access');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000001',true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 p:=jsonb_build_object('title','Delivery task','description','Team work','expected_outcome','Documented result','due_date',current_date+2,'priority','high','assignee_id','47000000-0000-0000-0000-000000000002','reviewer_id','47000000-0000-0000-0000-000000000003');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"assignee_id":"47000000-0000-0000-0000-000000000004"}'),'foreign assignee accepted');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"reviewer_id":"47000000-0000-0000-0000-000000000002"}'),'self approval accepted');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"job_id":"47200000-0000-0000-0000-000000000001"}'),'foreign job accepted');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"candidate_id":"47300000-0000-0000-0000-000000000001"}'),'foreign candidate accepted');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"expected_outcome":""}'),'missing outcome accepted');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"cycle_id":"47500000-0000-0000-0000-000000000002"}'),'foreign review linked');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"cycle_id":"47500000-0000-0000-0000-000000000003"}'),'unreleased review linked');
 p:=p||'{"cycle_id":"47500000-0000-0000-0000-000000000001"}';
 id:=(public.task_workflow(co,'create',p)->>'id')::uuid;
 PERFORM pg_temp.expect((SELECT count(*) FROM public.tasks WHERE company_id=co)=0,'company task raw read bypass');
 r:=pg_temp.task(co,id);v:=(r->>'version')::integer;
 PERFORM pg_temp.expect(r->>'column_status'='todo','task must start planned');
 PERFORM pg_temp.expect(r->>'cycle_id'='47500000-0000-0000-0000-000000000001','development review link missing');
 PERFORM pg_temp.expect(pg_temp.denied(co,'transition',jsonb_build_object('id',id,'version',v,'status','done')),'administrator skips execution');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000005',true);
 PERFORM pg_temp.expect(jsonb_array_length(public.task_workflow(co,'list','{}')->'tasks')=0,'unrelated member reads task');
 PERFORM pg_temp.expect(pg_temp.denied(co,'comment',jsonb_build_object('id',id,'version',v,'text','intrusion')),'null reviewer allows unrelated mutation');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000004',true);
 PERFORM pg_temp.expect(pg_temp.denied(co,'list','{}'),'cross company list');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000002',true);
 PERFORM pg_temp.expect(jsonb_array_length(public.task_workflow(co,'list','{}')->'tasks')=1,'assignee cannot find task');
 PERFORM pg_temp.expect(pg_temp.denied(co,'create',p||'{"assignee_id":"47000000-0000-0000-0000-000000000003"}'),'member assigns other members');
 PERFORM pg_temp.mutate(co,id,'transition','{"status":"in_progress"}');
 PERFORM pg_temp.expect(pg_temp.denied(co,'work',jsonb_build_object('id',id,'version',v,'subtasks','[]'::jsonb)),'stale update accepted');
 PERFORM pg_temp.expect(pg_temp.denied(co,'transition',jsonb_build_object('id',id,'version',(pg_temp.task(co,id)->>'version')::integer,'status','done')),'assignee bypasses reviewer');
 PERFORM pg_temp.expect(pg_temp.denied(co,'transition',jsonb_build_object('id',id,'version',(pg_temp.task(co,id)->>'version')::integer,'status','in_review')),'empty result submitted');
 PERFORM pg_temp.mutate(co,id,'work','{"completion_note":"Delivered","blocked_reason":"Waiting for files","subtasks":[{"id":"a","title":"Check result","completed":false}]}');
 PERFORM pg_temp.expect(pg_temp.denied(co,'transition',jsonb_build_object('id',id,'version',(pg_temp.task(co,id)->>'version')::integer,'status','in_review')),'blocked or incomplete work submitted');
 PERFORM pg_temp.mutate(co,id,'work','{"completion_note":"Delivered","blocked_reason":"","subtasks":[{"id":"a","title":"Check result","completed":true}]}');
 PERFORM pg_temp.mutate(co,id,'transition','{"status":"in_review"}');
 PERFORM pg_temp.expect(pg_temp.denied(co,'work',jsonb_build_object('id',id,'version',(pg_temp.task(co,id)->>'version')::integer,'subtasks','[]'::jsonb)),'submitted work changed');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000001',true);
 PERFORM pg_temp.expect(pg_temp.denied(co,'transition',jsonb_build_object('id',id,'version',(pg_temp.task(co,id)->>'version')::integer,'status','done')),'administrator approves instead of assigned reviewer');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000003',true);
 PERFORM pg_temp.expect(pg_temp.denied(co,'transition',jsonb_build_object('id',id,'version',(pg_temp.task(co,id)->>'version')::integer,'status','in_progress')),'revision without reason');
 PERFORM pg_temp.mutate(co,id,'transition','{"status":"in_progress","reason":"Add verification details"}');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000002',true);
 PERFORM pg_temp.mutate(co,id,'transition','{"status":"in_review"}');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000003',true);
 PERFORM pg_temp.mutate(co,id,'transition','{"status":"done"}');
 PERFORM pg_temp.expect(pg_temp.task(co,id)->>'completed_at' IS NOT NULL,'completion timestamp missing');
 PERFORM pg_temp.mutate(co,id,'comment','{"text":"Approved evidence","actor_name":"Forged author"}');
 r:=pg_temp.task(co,id);
 PERFORM pg_temp.expect(r->'events'->-1->>'actor_id'='47000000-0000-0000-0000-000000000003','comment author is not server identity');
 PERFORM pg_temp.expect(r->'events'->-1->>'actor_name'<>'Forged author','comment author spoofed');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000001',true);
 PERFORM pg_temp.mutate(co,id,'transition','{"status":"todo","reason":"New evidence required"}');
 PERFORM pg_temp.expect(pg_temp.task(co,id)->>'completion_note'='','reopen retains accepted evidence');
 PERFORM pg_temp.mutate(co,id,'archive','{}');
 PERFORM pg_temp.expect(pg_temp.task(co,id) IS NULL,'archived task in active list');
 SELECT x INTO r FROM jsonb_array_elements(public.task_workflow(co,'list','{"archived":true}')->'tasks') x WHERE x->>'id'=id::text;
 PERFORM pg_temp.expect(r IS NOT NULL,'archive cannot be restored');
 PERFORM public.task_workflow(co,'restore',jsonb_build_object('id',id,'version',(r->>'version')::integer));
 PERFORM pg_temp.expect(pg_temp.task(co,id)->>'column_status'='todo','restore loses state');
 own_id:=(public.task_workflow(co,'create',p||'{"assignee_id":"47000000-0000-0000-0000-000000000001","reviewer_id":null,"cycle_id":null}')->>'id')::uuid;
 -- A NULL reviewer must not turn a three-valued authorization expression into an allow.
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000005',true);
 PERFORM pg_temp.expect(pg_temp.denied(co,'comment',jsonb_build_object('id',own_id,'version',2,'text','intrusion')),'NULL reviewer authorization bypass');
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000001',true);
 PERFORM pg_temp.mutate(co,own_id,'transition','{"status":"in_progress"}');
 PERFORM pg_temp.mutate(co,own_id,'work','{"subtasks":[],"completion_note":"Owner delivery"}');
 PERFORM pg_temp.mutate(co,own_id,'transition','{"status":"done"}');
 PERFORM public.task_workflow(co,'import',p||'{"id":"47400000-0000-0000-0000-000000000001"}');
 PERFORM pg_temp.expect(jsonb_array_length(public.task_workflow(co,'list','{}')->'legacy')=0,'legacy import remains unscoped');
 EXECUTE 'RESET ROLE';
 UPDATE auth.users SET banned_until=now()+interval '1 day' WHERE auth.users.id='47000000-0000-0000-0000-000000000001';
 EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM pg_temp.expect(pg_temp.denied(co,'list','{}'),'banned stale token allowed');
 EXECUTE 'RESET ROLE';
 UPDATE auth.users SET banned_until=NULL WHERE auth.users.id='47000000-0000-0000-0000-000000000001';
 DELETE FROM public.company_members WHERE company_id=co AND user_id='47000000-0000-0000-0000-000000000003';
 PERFORM set_config('request.jwt.claim.sub','47000000-0000-0000-0000-000000000003',true);
 EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM pg_temp.expect(pg_temp.denied(co,'list','{}'),'removed reviewer reads tasks');
END$$;
ROLLBACK;
