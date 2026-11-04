-- Isolated fixture transaction; no production test data.
BEGIN;
SET LOCAL session_replication_role=replica;
INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES ('48000000-0000-0000-0000-000000000001','draft-owner@example.test','{}'),('48000000-0000-0000-0000-000000000002','draft-reviewer@example.test','{}');
INSERT INTO public.companies(id,name,owner_user_id,status) VALUES ('48100000-0000-0000-0000-000000000001','Draft test','48000000-0000-0000-0000-000000000001','active');
INSERT INTO public.company_members(company_id,user_id,member_role) VALUES ('48100000-0000-0000-0000-000000000001','48000000-0000-0000-0000-000000000001','owner'),('48100000-0000-0000-0000-000000000001','48000000-0000-0000-0000-000000000002','viewer');
SET LOCAL session_replication_role=origin;
CREATE FUNCTION pg_temp.expect(ok boolean,msg text) RETURNS void LANGUAGE plpgsql AS $$BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION 'Draft test: %',msg;END IF;END$$;
CREATE FUNCTION pg_temp.denied(co uuid,op text,p jsonb) RETURNS boolean LANGUAGE plpgsql AS $$BEGIN PERFORM public.performance360(co,op,p);RETURN false;EXCEPTION WHEN OTHERS THEN RETURN true;END$$;
DO $$DECLARE co uuid:='48100000-0000-0000-0000-000000000001'; c uuid;p jsonb;r jsonb;BEGIN
 PERFORM set_config('request.jwt.claim.sub','48000000-0000-0000-0000-000000000001',true);EXECUTE 'SET LOCAL ROLE authenticated';
 p:=jsonb_build_object('title','Initial','subject_id','48000000-0000-0000-0000-000000000001','period_start',current_date-30,'period_end',current_date,'deadline',now()+interval '7 days','criteria','[{"id":"a","title":"One","description":"One","weight":50},{"id":"b","title":"Two","description":"Two","weight":30},{"id":"c","title":"Three","description":"Three","weight":20}]'::jsonb);
 c:=(public.performance360(co,'create',p)->>'id')::uuid;p:=p||jsonb_build_object('cycle_id',c,'version',1,'title','Revised');
 PERFORM public.performance360(co,'edit',p);
 PERFORM pg_temp.expect(pg_temp.denied(co,'edit',p),'stale draft overwrites new version');
 p:=p||'{"version":2}';
 PERFORM pg_temp.expect(pg_temp.denied(co,'edit',p||'{"subject_id":"48000000-0000-0000-0000-000000000002"}'),'subject changed under assigned roster');
 PERFORM pg_temp.expect(pg_temp.denied(co,'edit',jsonb_set(p,'{criteria,0,weight}','49')),'invalid edited weights');
 PERFORM public.performance360(co,'assign',jsonb_build_object('cycle_id',c,'reviewer_id','48000000-0000-0000-0000-000000000002','relationship','manager'));
 EXECUTE 'RESET ROLE';UPDATE auth.users SET banned_until=now()+interval '1 day' WHERE id='48000000-0000-0000-0000-000000000002';EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM pg_temp.expect(pg_temp.denied(co,'open',jsonb_build_object('cycle_id',c)),'cycle opened with banned reviewer');
 EXECUTE 'RESET ROLE';UPDATE auth.users SET banned_until=NULL WHERE id='48000000-0000-0000-0000-000000000002';EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.performance360(co,'open',jsonb_build_object('cycle_id',c));
 PERFORM pg_temp.expect(pg_temp.denied(co,'edit',p),'open draft edited');
END$$;
ROLLBACK;
