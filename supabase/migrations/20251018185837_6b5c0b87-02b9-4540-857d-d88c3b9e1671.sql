-- Add Locksmith & Security Services Category Structure
-- Deactivate old entries if they exist
UPDATE service_categories SET is_active = false 
WHERE slug IN ('locksmith-security-services', 'locksmith-security', 'security-services');

UPDATE service_subcategories SET is_active = false 
WHERE category_id IN (
  SELECT id FROM service_categories 
  WHERE slug IN ('locksmith-security-services', 'locksmith-security', 'security-services')
);

UPDATE service_micro_categories SET is_active = false 
WHERE subcategory_id IN (
  SELECT id FROM service_subcategories 
  WHERE category_id IN (
    SELECT id FROM service_categories 
    WHERE slug IN ('locksmith-security-services', 'locksmith-security', 'security-services')
  )
);

-- Insert main category
INSERT INTO service_categories (name, slug, icon_name, description, category_group, display_order, is_active)
VALUES (
  'Locksmith & Security Services',
  'locksmith-security-services',
  'Lock',
  'Professional locksmith and comprehensive security system services',
  'specialized',
  18,
  true
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon_name = EXCLUDED.icon_name,
  description = EXCLUDED.description,
  is_active = true;

-- Insert subcategories
INSERT INTO service_subcategories (category_id, name, slug, description, display_order, is_active)
SELECT 
  c.id,
  sub.name,
  sub.slug,
  sub.description,
  sub.display_order,
  true
FROM service_categories c
CROSS JOIN (VALUES
  ('Locksmith Services & Key Systems', 'locksmith-key-systems', 'Emergency lockouts, lock repairs, and key systems', 1),
  ('Door & Entry Security Systems', 'door-entry-security', 'Door reinforcement and advanced entry security', 2),
  ('Alarm & Intruder Systems', 'alarm-intruder-systems', 'Burglar alarms and intruder detection systems', 3),
  ('CCTV & Surveillance Systems', 'cctv-surveillance', 'Video surveillance and camera monitoring systems', 4),
  ('Access Control & Entry Systems', 'access-control-entry', 'Modern access control and entry management', 5),
  ('Safe & Vault Services', 'safe-vault-services', 'Safe installation and secure storage solutions', 6),
  ('Security Lighting & Smart Integration', 'security-lighting-smart', 'Smart security lighting and home automation', 7)
) AS sub(name, slug, description, display_order)
WHERE c.slug = 'locksmith-security-services'
ON CONFLICT (category_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Locksmith Services & Key Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Emergency lockout service (24/7)', 'emergency-lockout-service', '24/7 emergency lockout assistance', 1),
  ('Lock repair & replacement', 'lock-repair-replacement', 'Fix or replace damaged locks', 2),
  ('Key cutting & duplication', 'key-cutting-duplication', 'Professional key cutting services', 3),
  ('Lock rekeying & master key systems', 'lock-rekeying-master-key', 'Rekey locks and create master key systems', 4),
  ('High-security lock installation', 'high-security-lock-installation', 'Install advanced security locks', 5),
  ('Digital & smart locks (code or app-based)', 'digital-smart-locks', 'Modern electronic lock systems', 6),
  ('Door & window lock upgrades', 'door-window-lock-upgrades', 'Upgrade existing lock systems', 7),
  ('Safe installation & unlocking', 'safe-installation-unlocking', 'Install or unlock safes', 8),
  ('Mailbox & cabinet locks', 'mailbox-cabinet-locks', 'Locks for mailboxes and cabinets', 9),
  ('Padlock & gate lock fitting', 'padlock-gate-lock-fitting', 'Install outdoor and gate locks', 10),
  ('Keyless entry & access pad systems', 'keyless-entry-systems', 'Keyless entry pad installation', 11),
  ('Lock maintenance & lubrication', 'lock-maintenance-lubrication', 'Regular lock servicing', 12)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'locksmith-key-systems'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'locksmith-security-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Door & Entry Security Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Reinforced door installation', 'reinforced-door-installation', 'Install high-security reinforced doors', 1),
  ('Multi-point locking system fitting', 'multi-point-locking-systems', 'Advanced multi-point lock systems', 2),
  ('Security strike plate & hinge reinforcement', 'strike-plate-hinge-reinforcement', 'Strengthen door frames and hinges', 3),
  ('Anti-snap & anti-bump lock upgrades', 'anti-snap-bump-locks', 'Upgrade to anti-manipulation locks', 4),
  ('Peephole & door viewer installation', 'peephole-door-viewer', 'Install door viewing devices', 5),
  ('Security chains & restrictors', 'security-chains-restrictors', 'Door chain and restrictor fitting', 6),
  ('Door closers & automatic closers', 'door-closers-automatic', 'Install automatic door closing systems', 7),
  ('Steel & aluminum security doors', 'steel-aluminum-security-doors', 'Heavy-duty security door installation', 8),
  ('Fire exit hardware installation', 'fire-exit-hardware', 'Install fire-rated exit systems', 9),
  ('Access control keypad fitting', 'access-control-keypad', 'Electronic keypad entry systems', 10),
  ('Key fob entry systems', 'key-fob-entry-systems', 'Install fob-based access control', 11),
  ('Automatic gate & barrier integration', 'automatic-gate-barrier', 'Automated gate and barrier systems', 12)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'door-entry-security'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'locksmith-security-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Alarm & Intruder Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Burglar alarm installation (wired or wireless)', 'burglar-alarm-installation', 'Complete burglar alarm system setup', 1),
  ('Motion detector & PIR sensor setup', 'motion-detector-pir-sensors', 'Install motion detection sensors', 2),
  ('Smart alarm system integration', 'smart-alarm-integration', 'Connect alarm to smart home systems', 3),
  ('Door & window contact sensors', 'door-window-contact-sensors', 'Install entry point sensors', 4),
  ('Glass break & vibration sensors', 'glass-break-vibration-sensors', 'Window break detection sensors', 5),
  ('Panic & duress button installation', 'panic-duress-buttons', 'Emergency panic button systems', 6),
  ('Siren & strobe light setup', 'siren-strobe-light-setup', 'Install alarm notification devices', 7),
  ('App-based control & remote alerts', 'app-based-alarm-control', 'Mobile app alarm management', 8),
  ('Battery backup & power management', 'battery-backup-power', 'Backup power for alarm systems', 9),
  ('Alarm servicing & maintenance', 'alarm-servicing-maintenance', 'Regular alarm system maintenance', 10),
  ('System fault finding & reprogramming', 'alarm-fault-reprogramming', 'Diagnose and fix alarm issues', 11),
  ('Insurance-approved alarm systems', 'insurance-approved-alarms', 'Install certified alarm systems', 12)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'alarm-intruder-systems'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'locksmith-security-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for CCTV & Surveillance Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Indoor & outdoor CCTV installation', 'indoor-outdoor-cctv', 'Complete CCTV camera installation', 1),
  ('HD & IP camera setup', 'hd-ip-camera-setup', 'High-definition network cameras', 2),
  ('Wireless & cloud-based surveillance', 'wireless-cloud-surveillance', 'Wireless camera and cloud storage', 3),
  ('Night vision & infrared cameras', 'night-vision-infrared-cameras', 'Low-light and night vision cameras', 4),
  ('Remote viewing configuration (mobile access)', 'remote-viewing-mobile-access', 'Configure mobile camera viewing', 5),
  ('Network video recorder (NVR) setup', 'nvr-setup', 'Install recording and storage systems', 6),
  ('PTZ (pan-tilt-zoom) camera systems', 'ptz-camera-systems', 'Motorized pan-tilt-zoom cameras', 7),
  ('Hidden & discreet camera installation', 'hidden-discreet-cameras', 'Install covert surveillance cameras', 8),
  ('Perimeter & motion-triggered recording', 'perimeter-motion-recording', 'Motion-activated recording systems', 9),
  ('Commercial security camera systems', 'commercial-security-cameras', 'Large-scale commercial CCTV', 10),
  ('Video analytics & facial recognition', 'video-analytics-facial-recognition', 'AI-powered surveillance analysis', 11),
  ('Camera maintenance & firmware updates', 'camera-maintenance-updates', 'Regular camera servicing', 12)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'cctv-surveillance'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'locksmith-security-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Access Control & Entry Systems
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Keycard & fob access systems', 'keycard-fob-access', 'Card-based entry control systems', 1),
  ('Video intercom & door entry systems', 'video-intercom-door-entry', 'Video communication entry systems', 2),
  ('Smart access control panels', 'smart-access-control-panels', 'Advanced access control systems', 3),
  ('Biometric fingerprint & face ID entry', 'biometric-fingerprint-faceid', 'Biometric identification systems', 4),
  ('RFID & proximity reader systems', 'rfid-proximity-readers', 'Contactless access card readers', 5),
  ('Turnstile & barrier access controls', 'turnstile-barrier-controls', 'Physical barrier access systems', 6),
  ('Visitor management system setup', 'visitor-management-systems', 'Track and manage visitor access', 7),
  ('Remote unlocking integration', 'remote-unlocking-integration', 'Remote door control systems', 8),
  ('Building & multi-zone access programming', 'multi-zone-access-programming', 'Complex zone-based access control', 9),
  ('Time attendance & access tracking', 'time-attendance-tracking', 'Employee time and access logging', 10),
  ('Gate automation & motor integration', 'gate-automation-motor', 'Automated gate entry systems', 11),
  ('Access system maintenance & upgrades', 'access-system-maintenance', 'Regular access system servicing', 12)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'access-control-entry'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'locksmith-security-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Safe & Vault Services
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Home & office safe installation', 'home-office-safe-installation', 'Install residential and office safes', 1),
  ('Fireproof & digital safes', 'fireproof-digital-safes', 'Fire-resistant and electronic safes', 2),
  ('Wall & floor safe fitting', 'wall-floor-safe-fitting', 'Install concealed safes', 3),
  ('Safe combination reset & reprogramming', 'safe-combination-reset', 'Reset safe codes and combinations', 4),
  ('Keyed & electronic safe repairs', 'keyed-electronic-safe-repairs', 'Repair safe mechanisms', 5),
  ('Safe unlocking & emergency entry', 'safe-unlocking-emergency', 'Emergency safe opening services', 6),
  ('Vault door installation', 'vault-door-installation', 'Install heavy-duty vault doors', 7),
  ('Cash drop box & secure storage units', 'cash-drop-box-storage', 'Install drop boxes and secure units', 8),
  ('Jewelry & data safe systems', 'jewelry-data-safe-systems', 'Specialized safe installations', 9),
  ('Commercial safe servicing', 'commercial-safe-servicing', 'Maintain commercial safes', 10),
  ('Anchor bolts & mounting systems', 'anchor-bolts-mounting', 'Secure safe mounting and fixing', 11),
  ('Periodic safety checks & re-locking', 'periodic-safety-checks', 'Regular safe maintenance', 12)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'safe-vault-services'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'locksmith-security-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;

-- Insert micro-categories for Security Lighting & Smart Integration
INSERT INTO service_micro_categories (subcategory_id, name, slug, description, display_order, is_active)
SELECT 
  sc.id,
  micro.name,
  micro.slug,
  micro.description,
  micro.display_order,
  true
FROM service_subcategories sc
CROSS JOIN (VALUES
  ('Motion-activated lighting installation', 'motion-activated-lighting', 'Install motion sensor lights', 1),
  ('Perimeter & flood lighting setup', 'perimeter-flood-lighting', 'Outdoor security lighting systems', 2),
  ('Integrated alarm & lighting systems', 'integrated-alarm-lighting', 'Connect alarms with lighting', 3),
  ('Smart lighting & sensor automation', 'smart-lighting-automation', 'Automated smart lighting control', 4),
  ('Video doorbell installation (Ring, Nest, etc.)', 'video-doorbell-installation', 'Install smart video doorbells', 5),
  ('Smart home security hub setup', 'smart-home-security-hub', 'Central smart security system', 6),
  ('App-controlled lighting & cameras', 'app-controlled-lighting-cameras', 'Mobile-controlled security devices', 7),
  ('Energy-efficient LED security lighting', 'led-security-lighting', 'Energy-saving security lights', 8),
  ('Solar-powered security lights', 'solar-powered-security-lights', 'Off-grid solar security lighting', 9),
  ('Wireless connection & network setup', 'wireless-network-setup', 'Configure wireless security networks', 10),
  ('System syncing & automation testing', 'system-syncing-automation', 'Test and sync security automation', 11),
  ('Smart device support & updates', 'smart-device-support-updates', 'Maintain smart security devices', 12)
) AS micro(name, slug, description, display_order)
WHERE sc.slug = 'security-lighting-smart'
  AND sc.category_id = (SELECT id FROM service_categories WHERE slug = 'locksmith-security-services')
ON CONFLICT (subcategory_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = true;