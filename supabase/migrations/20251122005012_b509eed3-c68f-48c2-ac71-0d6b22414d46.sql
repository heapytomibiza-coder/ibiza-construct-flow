-- Seed Aluminio & Ventanas: Final working version
INSERT INTO services (category, subcategory, micro) VALUES
  ('aluminio-ventanas', 'carpinteria', 'ventanas-aluminio'),
  ('aluminio-ventanas', 'carpinteria', 'ventanas-pvc'),
  ('aluminio-ventanas', 'carpinteria', 'puertas-correderas'),
  ('aluminio-ventanas', 'carpinteria', 'cerramientos'),
  ('aluminio-ventanas', 'accesorios', 'mosquiteras'),
  ('aluminio-ventanas', 'vidrios', 'vidrios-seguridad')
ON CONFLICT (category, subcategory, micro) DO NOTHING;

DO $$
DECLARE v_uid1 uuid; v_uid2 uuid; v_svc1 uuid; v_svc2 uuid; v_svc3 uuid; v_svc4 uuid; v_svc5 uuid; v_svc6 uuid;
BEGIN
  SELECT id INTO v_svc1 FROM services WHERE micro='ventanas-aluminio' LIMIT 1;
  SELECT id INTO v_svc2 FROM services WHERE micro='ventanas-pvc' LIMIT 1;
  SELECT id INTO v_svc3 FROM services WHERE micro='puertas-correderas' LIMIT 1;
  SELECT id INTO v_svc4 FROM services WHERE micro='cerramientos' LIMIT 1;
  SELECT id INTO v_svc5 FROM services WHERE micro='mosquiteras' LIMIT 1;
  SELECT id INTO v_svc6 FROM services WHERE micro='vidrios-seguridad' LIMIT 1;

  SELECT id INTO v_uid1 FROM auth.users WHERE email='demo+aluglass@ibizafair.com';
  IF v_uid1 IS NULL THEN INSERT INTO auth.users (id,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at) VALUES (gen_random_uuid(),'demo+aluglass@ibizafair.com',crypt('DemoPass2025!',gen_salt('bf')),now(),'{"full_name":"Ibiza AluGlass Systems"}'::jsonb,now(),now()) RETURNING id INTO v_uid1; END IF;
  INSERT INTO profiles (id,full_name,display_name,active_role,preferred_language) VALUES (v_uid1,'Ibiza AluGlass Systems','Ibiza AluGlass Systems','professional','es') ON CONFLICT DO NOTHING;
  INSERT INTO user_roles (user_id,role) VALUES (v_uid1,'professional') ON CONFLICT DO NOTHING;
  INSERT INTO professional_profiles (user_id,business_name,primary_trade,bio,subsector_tags,ideal_clients,unique_selling_points,team_size,experience_years,languages,min_project_value,max_project_value,typical_project_duration,emergency_service,max_projects_in_parallel,certifications,insurance_details,sustainability_practices,whatsapp,contact_phone,contact_email,social_links,is_demo_profile,featured_at_events) VALUES (v_uid1,'Ibiza AluGlass Systems','aluminio-ventanas','Fabricación e instalación de ventanas, puertas y cerramientos de aluminio y PVC para villas y proyectos premium en Ibiza.','["Carpintería de aluminio","PVC","Cerramientos","Ventanas","Puertas correderas"]'::jsonb,'Propietarios de villas, arquitectos y constructoras.','["Sistemas europeos certificados","Instalaciones profesionales","Único equipo"]'::jsonb,14,'16','["ES","EN"]'::jsonb,1200,90000,'3–10 semanas',false,6,'["Distribuidores CE","Vidrios de seguridad","Eficiencia energética"]'::jsonb,'{"coverage":"RC 600k"}'::jsonb,'["Puente térmico","Vidrio energético","Reciclaje"]'::jsonb,'+34 600 713 224','+34 600 713 224','demo+aluglass@ibizafair.com','{"website":"https://ibizaaluglass.com","instagram":"https://instagram.com/ibizaaluglass"}'::jsonb,true,'["ibiza-fair-2025"]'::jsonb) ON CONFLICT DO NOTHING;
  INSERT INTO professional_service_items (professional_id,service_id,name,description,pricing_type,base_price,estimated_duration_minutes) VALUES (v_uid1,v_svc1,'Ventanas abatibles y oscilobatientes','Instalación con sistemas europeos','range',2000,960),(v_uid1,v_svc3,'Puertas correderas panorámicas','Gran formato con vidrio solar','range',8000,1920),(v_uid1,v_svc4,'Cerramientos de terrazas','Alta eficiencia','range',7000,2880),(v_uid1,v_svc5,'Mosquiteras a medida','Personalizadas','range',400,180),(v_uid1,v_svc6,'Puertas de entrada','Con vidrios de seguridad','range',4000,960),(v_uid1,v_svc2,'Sustitución de carpintería','PVC y aluminio','range',15000,4320);
  INSERT INTO professional_portfolio (professional_id,title,description,project_date,category) VALUES (v_uid1,'Cerramiento panorámico Vista Alegre','Correderas gran formato vidrio control solar',now()-interval'4 months','cerramientos'),(v_uid1,'Sustitución ventanas Santa Gertrudis','PVC alto aislamiento',now()-interval'7 months','ventanas');
  INSERT INTO professional_stats (professional_id,average_rating,total_reviews,completed_bookings) VALUES (v_uid1,4.9,84,127) ON CONFLICT DO NOTHING;

  SELECT id INTO v_uid2 FROM auth.users WHERE email='demo+ventanapro@ibizafair.com';
  IF v_uid2 IS NULL THEN INSERT INTO auth.users (id,email,encrypted_password,email_confirmed_at,raw_user_meta_data,created_at,updated_at) VALUES (gen_random_uuid(),'demo+ventanapro@ibizafair.com',crypt('DemoPass2025!',gen_salt('bf')),now(),'{"full_name":"VentanaPro Ibiza"}'::jsonb,now(),now()) RETURNING id INTO v_uid2; END IF;
  INSERT INTO profiles (id,full_name,display_name,active_role,preferred_language) VALUES (v_uid2,'VentanaPro Ibiza','VentanaPro Ibiza','professional','es') ON CONFLICT DO NOTHING;
  INSERT INTO user_roles (user_id,role) VALUES (v_uid2,'professional') ON CONFLICT DO NOTHING;
  INSERT INTO professional_profiles (user_id,business_name,primary_trade,bio,subsector_tags,ideal_clients,unique_selling_points,team_size,experience_years,languages,min_project_value,max_project_value,typical_project_duration,emergency_service,max_projects_in_parallel,certifications,insurance_details,sustainability_practices,whatsapp,contact_phone,contact_email,social_links,is_demo_profile,featured_at_events) VALUES (v_uid2,'VentanaPro Ibiza','aluminio-ventanas','Expertos en ventanas, puertas y cerramientos de alta eficiencia para viviendas y hoteles.','["Ventanas","Puertas","Cerramientos","Aislamiento térmico","Aislamiento acústico"]'::jsonb,'Hoteles, administradores, propietarios y arquitectos.','["Eficiencia energética y acústica","Servicio post-instalación","Proyectos residenciales y hoteleros"]'::jsonb,8,'9','["ES","EN","DE"]'::jsonb,900,60000,'2–8 semanas',false,4,'["Vidrios de seguridad","Acústica","Carpintería europea"]'::jsonb,'{"coverage":"RC 450k"}'::jsonb,'["Puente térmico","Baja emisividad","Reducción pérdidas"]'::jsonb,'+34 600 912 587','+34 600 912 587','demo+ventanapro@ibizafair.com','{"website":"https://ventanaproibiza.com","instagram":"https://instagram.com/ventanaproibiza"}'::jsonb,true,'["ibiza-fair-2025"]'::jsonb) ON CONFLICT DO NOTHING;
  INSERT INTO professional_service_items (professional_id,service_id,name,description,pricing_type,base_price,estimated_duration_minutes) VALUES (v_uid2,v_svc1,'Instalación ventanas y puertas','Alta eficiencia energética','range',1800,960),(v_uid2,v_svc2,'Sustitución carpintería antigua','Sistemas certificados','range',13000,3840),(v_uid2,v_svc4,'Cerramientos balcones terrazas','Personalizadas','range',6500,2400),(v_uid2,v_svc1,'Sistemas acústicos hoteles','Acústicas certificadas','range',3500,1440),(v_uid2,v_svc6,'Vidrios seguridad control solar','Templados certificación','range',2000,720),(v_uid2,v_svc3,'Puertas correderas plegables','Espacios amplios','range',8000,1920);
  INSERT INTO professional_portfolio (professional_id,title,description,project_date,category) VALUES (v_uid2,'Renovación hotel Figueretes','Ventanas puertas acústicas certificadas',now()-interval'5 months','hoteles'),(v_uid2,'Cerramiento terraza villa','Plegable vidrio templado aislamiento',now()-interval'3 months','cerramientos');
  INSERT INTO professional_stats (professional_id,average_rating,total_reviews,completed_bookings) VALUES (v_uid2,4.7,61,93) ON CONFLICT DO NOTHING;
END $$;