/* Original practice questions based on the supplied 162-page INTE 401 PDF. */
(function (global) {
  'use strict';
  const sources = {
    module: global.CipherLabReviewer.filename,
  };
  const topics = global.CipherLabReviewer.topics.map(topic => ({
    ...topic, reference: global.CipherLabReviewer.source(topic.id),
  }));
  const cards = [];
  function card(topic, question, options, explanation, added = false) {
    // Rotate the source choices as well as shuffling them when a quiz is created.
    const offset = cards.length % 4;
    const choices = options.slice(offset).concat(options.slice(0, offset));
    cards.push({
      id: `inte401-${String(cards.length + 1).padStart(3, '0')}`,
      topic, question, choices, answer: choices.indexOf(options[0]), explanation, added,
      source: topics.find(item => item.id === topic).reference,
    });
  }

  // Access control — 14 cards.
  card('access', 'Entering a username claims an identity. Which IAAA function is this?',
    ['Identification', 'Authorization', 'Accountability', 'Encryption'],
    'Identification states who the subject claims to be. Authentication must then verify that claim.');
  card('access', 'A security key verifies that a login claim is genuine. Which function is being performed?',
    ['Authentication', 'Authorization', 'Identification only', 'Accounting for storage space'],
    'Authentication checks evidence of identity; it does not by itself decide which resources are allowed.');
  card('access', 'A logged-in clerk is denied permission to delete payroll records. Which function makes that decision?',
    ['Authorization', 'Identification', 'Cryptanalysis', 'Fingerprint enrollment'],
    'Authorization evaluates permissions for an action on a resource, even after a successful login.');
  card('access', 'Which evidence best supports accountability after a record is changed?',
    ['An audit entry linking a unique user, time and action', 'A shared anonymous account', 'A list of monitor sizes', 'A ciphertext with no identity records'],
    'Accountability requires actions to be traceable to an identity through reliable audit records.');
  card('access', 'Which pair combines two different authentication factor categories?',
    ['Password and security key', 'Password and PIN', 'Two separate passwords', 'Username and employee number'],
    'A password is something known; a security key is something possessed. Two knowledge secrets remain one factor category.');
  card('access', 'In an access-control decision, which pairing correctly identifies subject and object?',
    ['A process is the subject; the file it requests is the object', 'A file is always the subject; a user is always the object', 'Both must be human employees', 'Both must be passwords'],
    'The subject requests an action. The object is the resource on which the action would be performed.');
  card('access', 'A file owner chooses which classmates may read a folder. Which access model fits?',
    ['Discretionary access control (DAC)', 'Mandatory access control (MAC)', 'Port address translation (PAT)', 'Stateful inspection'],
    'DAC gives the resource owner discretion over permissions.');
  card('access', 'A central classification policy compares document labels with user clearance. Which model fits?',
    ['Mandatory access control (MAC)', 'Discretionary access control (DAC)', 'Task-based access control only', 'A one-time pad'],
    'MAC enforces centrally defined classifications and clearances rather than owner-selected sharing.');
  card('access', 'All employees assigned the cashier role receive the same transaction permissions. Which model fits?',
    ['Role-based access control (RBAC)', 'Attribute-based encryption', 'A Caesar substitution', 'Packet filtering'],
    'RBAC associates permissions with job roles and assigns users to those roles.');
  card('access', 'Approval rights exist only while a staff member handles an assigned workflow step. Which model fits?',
    ['Task-based access control (TBAC)', 'Port scanning', 'Biometric matching', 'Network address translation'],
    'TBAC ties access to a task or workflow, often for the duration of that assignment.');
  card('access', 'A policy considers department, device trust and time of day before granting access. Which model is most suitable?',
    ['Attribute-based access control (ABAC)', 'A fixed Caesar shift', 'DAC based only on owner preference', 'A packet sniffer'],
    'ABAC evaluates attributes of the subject, resource and environment.');
  card('access', 'A trainee receives read-only access to the one database needed for work. Which principle is applied?',
    ['Least privilege', 'Default allow', 'Universal administration', 'Key reuse'],
    'Least privilege grants the minimum permissions necessary for the job.');
  card('access', 'One employee requests a payment and a different employee approves it. Which principle is applied?',
    ['Separation of duties', 'A shared identity', 'Unrestricted access', 'A polyalphabetic shift'],
    'Separating sensitive steps reduces the chance that one person can misuse the entire process.');
  card('access', 'Management sets security policy, funding and responsibility before staff implement safeguards. Which approach is this?',
    ['Top-down security management', 'Bottom-up security management', 'Passive packet capture', 'A substitution alphabet'],
    'The revised Unit I describes a top-down approach driven by management direction and accountability.');

  // Firewalls — 12 cards.
  card('firewalls', 'What is the primary purpose of a firewall?',
    ['Enforce traffic policy across a trust boundary', 'Replace every endpoint patch', 'Guarantee that all users are trustworthy', 'Recover every deleted file'],
    'A firewall permits or denies network traffic according to policy. Other safeguards still address other risks.');
  card('firewalls', 'Which fields does a basic static packet filter commonly inspect?',
    ['IP addresses, protocols and ports', 'Fingerprint minutiae only', 'Employee salaries only', 'Plaintext letter frequencies only'],
    'Static filters compare packet-header fields with configured access-control rules.');
  card('firewalls', 'What distinguishes a dynamic packet filter from a purely static filter?',
    ['It can adjust temporary rules as traffic or events change', 'It needs no security policy', 'It authenticates faces', 'It replaces all traffic with hashes'],
    'Dynamic filtering can change temporary rule entries in response to observed traffic or events.');
  card('firewalls', 'Which extra information helps a stateful firewall recognize a reply packet?',
    ['A table of tracked connections', 'A list of random pads', 'A biometric template database', 'A student attendance sheet'],
    'Stateful inspection uses connection state in addition to packet fields.');
  card('firewalls', 'Which firewall type acts as an intermediary for application requests?',
    ['Application proxy', 'A passive biometric sensor', 'A transposition grid', 'A password-only login'],
    'An application proxy handles requests at the application level, giving visibility into application behavior.');
  card('firewalls', 'Under default deny, what happens to traffic with no matching allow rule?',
    ['It is rejected', 'It is always trusted', 'It is automatically encrypted and allowed', 'It receives administrator rights'],
    'Default deny requires explicit permission before a flow is accepted.');
  card('firewalls', 'Where should an organization place a public web server to separate it from the internal LAN?',
    ['In a DMZ with restricted paths to internal systems', 'Inside every user account', 'In the password file', 'In the unrestricted payroll subnet'],
    'A DMZ is an intermediate network for exposed services, with controlled access to the internal network.');
  card('firewalls', 'What is a bastion host?',
    ['A specially hardened system exposed at a network boundary', 'Any forgotten unpatched server', 'A network of decoy computers', 'A biometric error rate'],
    'A bastion host is deliberately hardened because its exposed role makes it a likely target.');
  card('firewalls', 'What does dual-homed mean for a firewall host?',
    ['It has two network interfaces', 'It has two passwords', 'It uses two different ciphers', 'It stores two biometric templates'],
    'A dual-homed host has two interfaces, commonly connecting different network segments.');
  card('firewalls', 'What is the basic function of NAT?',
    ['Translate network addresses', 'Classify fingerprint errors', 'Verify every application payload', 'Generate a random one-time pad'],
    'Network Address Translation changes addressing information. Translation alone is not a complete traffic-security policy.');
  card('firewalls', 'Which mechanism lets many internal sessions share a public IP by distinguishing port mappings?',
    ['Port Address Translation (PAT)', 'Role-based access control', 'False rejection rate', 'A Caesar cipher'],
    'PAT uses port mappings to distinguish sessions sharing a translated public address.');
  card('firewalls', 'A database is needed only by an application server. Which Internet-facing rule best follows least privilege?',
    ['Deny direct public database access; allow only the required application path', 'Allow every Internet host to query it', 'Trust all traffic because NAT is enabled', 'Disable logging to simplify rules'],
    'Expose only required service paths. Public web access does not imply public access to the database.');

  // Remote connections — 8 cards; protocol details are supplemental to the PDF.
  card('remote', 'What does remote access allow a user to do?',
    ['Reach organizational resources from another network or location', 'Bypass all authorization checks', 'Avoid identity verification permanently', 'Replace the local operating system'],
    'Remote access extends connectivity beyond the local network and still requires identity, permission and transport safeguards.', true);
  card('remote', 'Which combination best protects a remote administrative connection?',
    ['MFA, restricted privileges, encrypted transport and useful logs', 'A shared password and unlimited access', 'No session timeout or event records', 'Public exposure of every management service'],
    'These added remote-access safeguards verify identity, limit rights, protect communications and retain evidence.', true);
  card('remote', 'What is the main purpose of a securely configured VPN?',
    ['Provide a protected communication channel over another network', 'Guarantee that every endpoint is malware-free', 'Replace all permissions', 'Publish a private network to everyone'],
    'A VPN protects the channel; endpoint condition and access permissions need separate controls.', true);
  card('remote', 'Which VPN arrangement connects one remote user or device to a private network?',
    ['Remote-access VPN', 'Site-to-site VPN', 'A honeynet', 'A static substitution table'],
    'Remote-access VPNs connect users or devices; site-to-site VPNs connect networks.', true);
  card('remote', 'Which VPN arrangement links two office networks?',
    ['Site-to-site VPN', 'A biometric template', 'Remote-access VPN for one user only', 'A packet signature'],
    'A site-to-site VPN links networks at different locations.', true);
  card('remote', 'Which service commonly centralizes AAA for network access?',
    ['RADIUS', 'PAT', 'A transposition key', 'CER'],
    'RADIUS supplies centralized authentication, authorization and accounting in many network-access deployments.', true);
  card('remote', 'Which system is associated with granular administrative command authorization on network devices?',
    ['TACACS+', 'A Caesar wheel', 'NAT alone', 'A biometric false accept'],
    'TACACS+ is added background for centralized administrative AAA on devices such as routers and switches.', true);
  card('remote', 'Which authentication system uses a KDC and tickets?',
    ['Kerberos', 'A port scanner', 'Vigenère', 'A DMZ'],
    'Kerberos uses a Key Distribution Center and tickets, including a ticket-granting ticket and service tickets.', true);

  // Controls — 10 cards.
  card('controls', 'Which CIA property limits disclosure to authorized parties?',
    ['Confidentiality', 'Availability', 'Identification', 'Port translation'],
    'Confidentiality protects information against unauthorized disclosure.');
  card('controls', 'Which CIA property concerns trustworthy data and protection from unauthorized alteration?',
    ['Integrity', 'Availability', 'Identification', 'Default allow'],
    'Integrity concerns the correctness and trustworthiness of data and changes to it.');
  card('controls', 'Which CIA property is harmed when a required service cannot be used?',
    ['Availability', 'Confidentiality alone', 'Identification', 'Polyalphabetic substitution'],
    'Availability means that data and services are accessible when required.');
  card('controls', 'Why combine MFA, segmentation, logging and backups?',
    ['They address different failure modes through defense in depth', 'They make all security policies unnecessary', 'They guarantee that no incident can occur', 'They all perform exactly the same function'],
    'Defense in depth combines complementary safeguards so protection does not depend on one barrier.');
  card('controls', 'A written security policy and employee training are primarily which implementation category?',
    ['Administrative controls', 'Physical controls only', 'Ciphertext', 'Address translation'],
    'Administrative controls include policies, procedures and training. This classification is added study context.', true);
  card('controls', 'Which example is a physical safeguard?',
    ['A locked server-room door', 'A password-complexity rule alone', 'A packet-filter ACL alone', 'A hash formula'],
    'Locks and barriers protect physical access. Control-category detail is added study context.', true);
  card('controls', 'MFA blocks a login attempt that has only a stolen password. What control function is illustrated?',
    ['Preventive', 'Recovery', 'Identification only', 'Post-incident restoration'],
    'The action prevents unauthorized entry before the attempted access succeeds.', true);
  card('controls', 'A monitoring rule alerts an analyst to repeated failed sign-ins. What control function is illustrated?',
    ['Detective', 'Recovery', 'Corrective repair', 'Address translation'],
    'The alert detects suspicious activity; raising an alert is distinct from repairing or restoring a system.', true);
  card('controls', 'Removing detected malware and fixing its entry point primarily performs which control function?',
    ['Corrective', 'Identification', 'Recovery from backup only', 'Deterrent signage only'],
    'Corrective controls repair a detected problem. Restoring lost operational capability is a recovery function.', true);
  card('controls', 'Restoring a tested backup after an outage primarily performs which control function?',
    ['Recovery', 'Identification', 'Deterrence only', 'Static packet filtering'],
    'Recovery restores service or data after disruption. A backup must be restorable to provide this benefit.', true);

  // IDPS — 14 cards.
  card('idps', 'What does an IDS primarily do when it recognizes suspicious activity?',
    ['Observe, record and alert', 'Guarantee automatic blocking in every deployment', 'Replace all patch management', 'Generate biometric templates'],
    'Intrusion detection observes events and raises alerts. Prevention adds the ability to intervene.');
  card('idps', 'Which capability distinguishes an IPS from a purely alerting IDS?',
    ['It can actively block or interrupt detected activity', 'It never needs tuning', 'It prevents every unknown attack', 'It removes the need for backups'],
    'An IPS can take preventive action, such as dropping traffic, depending on its configuration and placement.');
  card('idps', 'Which sensor is best placed to inspect traffic at a network monitoring point?',
    ['Network-based IDPS', 'A fingerprint reader', 'An offline password list', 'A transposition grid'],
    'A network-based sensor observes traffic visible at its monitoring point.');
  card('idps', 'Which sensor directly observes changes to local files and processes?',
    ['Host-based IDPS', 'A DMZ alone', 'NAT alone', 'A public DNS record'],
    'A host-based agent has visibility into local files, logs, processes and host activity.');
  card('idps', 'A sensor watches mirrored traffic without sitting in the forwarding path. Which deployment is this?',
    ['Passive', 'Inline', 'Mandatory access control', 'A one-time pad'],
    'Passive monitoring observes a copy of traffic. An inline device lies on the traffic path.');
  card('idps', 'Why can an inline IPS drop a packet before it reaches the destination?',
    ['The packet passes through the IPS on its forwarding path', 'The IPS knows every user password', 'Its log file is a biometric template', 'It works without seeing traffic'],
    'Inline placement allows an enforcement decision before the traffic is forwarded.');
  card('idps', 'A detector matches a known malicious byte sequence. Which detection approach is this?',
    ['Signature-based detection', 'Anomaly detection only', 'A Caesar substitution', 'Biometric enrollment'],
    'Signature detection looks for known attack patterns and may miss sufficiently unfamiliar variants.');
  card('idps', 'A detector compares activity against normal traffic baselines. Which approach is this?',
    ['Anomaly-based detection', 'Static substitution', 'Mandatory classification', 'A one-time pad'],
    'Anomaly detection identifies deviations from expected behavior. A deviation still needs investigation.');
  card('idps', 'A detector checks whether messages follow valid protocol states and sequences. Which approach is this?',
    ['Stateful protocol analysis', 'Fingerprint enrollment', 'Alphabet transposition', 'A recovery-only control'],
    'Stateful protocol analysis compares protocol behavior with expected valid operation.');
  card('idps', 'An actual attack produces an alert. How is this classified?',
    ['True positive', 'False positive', 'False negative', 'True negative'],
    'A true positive correctly identifies an attack.');
  card('idps', 'Routine backup traffic incorrectly produces an attack alert. How is this classified?',
    ['False positive', 'True positive', 'False negative', 'True negative'],
    'A false positive is an alert on activity that is not an attack.');
  card('idps', 'An actual intrusion produces no alert. How is this classified?',
    ['False negative', 'False positive', 'True positive', 'True negative'],
    'A false negative misses an attack that is really occurring.');
  card('idps', 'Harmless traffic correctly produces no alert. How is this classified?',
    ['True negative', 'False positive', 'True positive', 'False negative'],
    'A true negative correctly leaves nonmalicious activity unflagged.');
  card('idps', 'What is the purpose of tuning IDPS rules and thresholds?',
    ['Improve useful alerts while reducing noise and avoiding blind spots', 'Disable every alert permanently', 'Guarantee no future attack exists', 'Replace sensor placement decisions'],
    'Tuning adjusts rules, thresholds and exclusions. Overly broad exclusions can conceal real attacks.');

  // Honeypots — 8 cards.
  card('honeypots', 'What is a honeypot?',
    ['A monitored decoy system or service', 'The production password database', 'A biometric factor', 'A substitution alphabet'],
    'A honeypot attracts and records suspicious interactions with a decoy.');
  card('honeypots', 'What distinguishes a honeynet from a single honeypot?',
    ['It is a controlled network of decoy systems', 'It is a password policy', 'It contains no monitoring', 'It is a biometric error rate'],
    'A honeynet combines decoys into a network that can simulate several systems.');
  card('honeypots', 'What is the purpose of a padded cell in the course material?',
    ['Contain suspicious activity in an isolated observation environment', 'Publish administrator credentials', 'Remove the need for authorization', 'Make the Internet a trusted network'],
    'A padded cell provides containment and observation of suspicious interactions.');
  card('honeypots', 'Which benefit can a monitored decoy provide?',
    ['Evidence of attempted commands and attacker tactics', 'A guarantee that production systems cannot be attacked', 'Automatic restoration of every database', 'A replacement for all access controls'],
    'A decoy can reveal tactics and attempted actions, but its visibility and protection are limited.');
  card('honeypots', 'Why must a honeypot be isolated from production resources?',
    ['A compromised decoy could otherwise become a path into real systems', 'Decoys cannot produce log records', 'Isolation changes it into a hash function', 'Production passwords should be copied into it'],
    'Containment limits the damage an attacker could cause after interacting with or compromising the decoy.');
  card('honeypots', 'Which statement describes a limitation of honeypots?',
    ['They do not directly protect every production resource', 'They remove the need for monitoring', 'They always prevent all intrusions', 'They can operate safely without containment'],
    'Decoys supplement other safeguards. Attacks that never touch a decoy may remain invisible to it.');
  card('honeypots', 'A decoy emulates only a few services. Which added-study category fits?',
    ['Low-interaction honeypot', 'High-interaction honeypot', 'Site-to-site VPN', 'Biometric enrollment'],
    'A low-interaction decoy exposes limited emulated services, generally reducing realism and operational risk.', true);
  card('honeypots', 'A decoy offers a realistic environment with richer activity evidence and greater containment demands. Which category fits?',
    ['High-interaction honeypot', 'Low-interaction honeypot', 'A static ACL', 'A false rejection rate'],
    'High-interaction environments provide realism but require stronger monitoring and containment.', true);

  // Scanning and analysis — 10 cards.
  card('scanning', 'Gathering publicly visible information about an organization is called what?',
    ['Footprinting', 'Fingerprinting a biometric sample', 'Cipher decryption', 'Backup restoration'],
    'Footprinting maps public exposure, such as published organizational and DNS information.');
  card('scanning', 'Identifying a service version or operating system from technical characteristics is called what?',
    ['Fingerprinting', 'Biometric enrollment', 'A one-time pad', 'Separation of duties'],
    'Technical fingerprinting identifies technologies or versions; it differs from collecting broad public information.');
  card('scanning', 'Which tool category answers which ports and services are reachable?',
    ['Port scanner', 'Biometric matcher', 'Vigenère table', 'Backup utility'],
    'A port scanner probes or observes service reachability. An open port is not automatically a vulnerability.');
  card('scanning', 'Which tool category flags evidence of known weaknesses or misconfiguration?',
    ['Vulnerability scanner', 'A transposition grid', 'A fingerprint sensor', 'A course attendance log'],
    'Vulnerability scanners identify potential weaknesses that should be validated and prioritized.');
  card('scanning', 'Which tool category inspects captured traffic and protocol fields?',
    ['Packet or protocol analyzer', 'A biometric matcher', 'A one-time-pad generator', 'An access role list'],
    'A packet analyzer helps interpret captured network traffic and its protocol structure.');
  card('scanning', 'Which tool category is most relevant to unexpected wireless access points?',
    ['Wireless analyzer', 'A Caesar cipher', 'A payroll application', 'A fingerprint template'],
    'Wireless analysis examines the radio or Wi-Fi environment, including visible access points.');
  card('scanning', 'What makes a scan active rather than passive?',
    ['It sends probes to the target', 'It only observes existing traffic', 'It cannot affect target logs', 'It never generates network activity'],
    'Active scanning sends probes, which can affect logs, latency or availability.');
  card('scanning', 'What characterizes passive analysis?',
    ['Observing existing traffic or information without initiating target probes', 'Sending many discovery packets', 'Attempting every password', 'Changing a firewall rule on every request'],
    'Passive analysis observes existing information instead of actively probing the target.');
  card('scanning', 'What should be established before scanning organizational systems?',
    ['Authorization, allowed targets and a test window', 'Permission to scan every unrelated Internet host', 'A public copy of private keys', 'Removal of all logs'],
    'A defined scope and authorization establish which systems and activities are permitted.');
  card('scanning', 'A scanner flags an outdated service. What is the best next step?',
    ['Validate the finding, assess risk, remediate and rescan', 'Assume successful exploitation is already proven', 'Ignore every other safeguard', 'Publish confidential scan data immediately'],
    'A finding is evidence to investigate. Validation and risk assessment determine the response.');

  // Biometrics — 10 cards.
  card('biometrics', 'What does biometric access control compare?',
    ['Features of a captured human characteristic with an enrolled reference', 'Only a username with a port number', 'Only a file size with an IP address', 'A cipher key with a firewall ACL'],
    'A biometric system captures a sample, extracts features and compares them with an enrolled template.');
  card('biometrics', 'Which is a physiological biometric example?',
    ['Fingerprint pattern', 'A memorized PIN', 'A security key', 'A repeated keyword'],
    'A fingerprint is a measurable physical characteristic, unlike a knowledge or possession authenticator.');
  card('biometrics', 'Which is a behavioral biometric example?',
    ['Keystroke rhythm', 'A static password string', 'A network port', 'A smart card serial number'],
    'BONUS example: keystroke rhythm concerns how a person performs an action. The PDF’s biometrics section focuses on physiological examples.', true);
  card('biometrics', 'What does enrollment establish for later biometric comparisons?',
    ['A reference template derived from the user’s captured features', 'A public one-time pad', 'A firewall state table', 'A transposition key'],
    'Enrollment creates the reference against which later samples are compared.');
  card('biometrics', 'An impostor is incorrectly admitted. Which metric records this kind of error?',
    ['False acceptance rate (FAR)', 'False rejection rate (FRR)', 'A true negative rate only', 'Packet-loss rate'],
    'False acceptance occurs when an unauthorized claimant is incorrectly accepted.');
  card('biometrics', 'An enrolled employee is incorrectly refused access. Which metric records this kind of error?',
    ['False rejection rate (FRR)', 'False acceptance rate (FAR)', 'A true positive rate only', 'A port-scan count'],
    'False rejection occurs when a legitimate enrolled user is incorrectly rejected.');
  card('biometrics', 'At the crossover or equal-error operating point, what is true?',
    ['FAR equals FRR', 'All users are accepted', 'All users are rejected', 'Both error rates must be zero'],
    'CER/EER is the point where false acceptance and false rejection rates are equal, not necessarily zero.');
  card('biometrics', 'What usually happens when the biometric matching threshold becomes stricter?',
    ['False accepts decrease while false rejects may increase', 'Both error rates always become zero', 'Every impostor becomes legitimate', 'The system stops needing enrollment'],
    'Requiring a closer match trades fewer false acceptances for more possible false rejections.');
  card('biometrics', 'Under this course module’s terminology, which event is a Type I biometric error?',
    ['A legitimate user is falsely rejected', 'An impostor is falsely accepted', 'An attack is correctly detected', 'A network packet is translated'],
    'The revised module, p. 95, labels a false reject Type I. Identify the event before relying on the error label.');
  card('biometrics', 'Under this course module’s terminology, which event is a Type II biometric error?',
    ['An impostor is falsely accepted', 'A legitimate user is falsely rejected', 'A valid user is correctly accepted', 'A password is changed successfully'],
    'The revised module, p. 95, labels a false accept Type II. This represents an unauthorized admission.');

  // Cryptography and the four practice ciphers — 14 cards.
  card('cryptography', 'Which description correctly distinguishes plaintext from ciphertext?',
    ['Plaintext is the readable input; ciphertext is the encrypted output', 'Plaintext is always a hash; ciphertext is always a password', 'Both must be numeric port lists', 'Ciphertext is the secret key itself'],
    'Encryption transforms plaintext into ciphertext using an algorithm and key.');
  card('cryptography', 'What is cryptanalysis?',
    ['Studying methods to analyze or defeat cryptographic protection', 'Only generating random passwords', 'Only restoring backups', 'Assigning network addresses'],
    'Cryptanalysis analyzes cryptographic systems and ways to recover information or defeat their protection.');
  card('cryptography', 'Which operation distinguishes substitution from transposition?',
    ['Substitution replaces symbols; transposition rearranges their positions', 'Both must replace every symbol with a digit', 'Transposition changes every symbol identity', 'Substitution only moves unchanged symbols'],
    'Substitution changes the mapping of symbols, while pure transposition changes the order of existing symbols.');
  card('cryptography', 'Why is Caesar described as monoalphabetic?',
    ['One fixed shift gives one consistent replacement for each letter', 'Every position uses an unrelated alphabet', 'It requires a public/private key pair', 'It changes only letter positions'],
    'For a fixed Caesar key, a given plaintext letter always has the same ciphertext replacement.');
  card('cryptography', 'Using a Caesar shift of +3, what does MOM become?',
    ['PRP', 'JLJ', 'MOM', 'RQR'],
    'M becomes P and O becomes R. MOM → PRP is the revised module’s example on p. 106.');
  card('cryptography', 'Decrypt KHOOR using a Caesar shift of 3. What is the plaintext?',
    ['HELLO', 'NKRRU', 'IFMMP', 'WORLD'],
    'Decryption shifts backward: K→H, H→E, O→L, O→L, R→O.');
  card('cryptography', 'What property is preserved by a pure transposition cipher?',
    ['The symbols and their occurrence counts', 'Every symbol’s original position', 'Only the vowels', 'A fixed hash digest'],
    'Rearrangement preserves the original symbols and frequencies even though their positions change.');
  card('cryptography', 'Using the PDF’s key 1→4, 2→8, 3→1, 4→5, 5→7, 6→2, 7→6, 8→3, what is ABCDEFGH with positions numbered right to left?',
    ['GDBEHACF', 'ABCDEFGH', 'HGFEDCBA', 'BADCFEHG'],
    'PDF p. 107 gives the eight-position permutation and right-to-left binary numbering, also used explicitly for these letters. The H at position 1 moves to position 4; all eight moves give GDBEHACF.');
  card('cryptography', 'Which letter values are used in the course’s Vernam arithmetic?',
    ['A=1 through Z=26', 'A=0 through Z=25', 'A=2 through Z=27', 'Only ASCII values'],
    'The module’s worked Vernam example adds letter positions in the range 1–26.');
  card('cryptography', 'Using course Vernam A=1, what is K(11) plus pad R(18)?',
    ['C, because 29 wraps to 3', 'B, because K must be 10', 'Z, because all sums stop at 26', 'R, because the key replaces the plaintext directly'],
    '11+18=29; subtract 26 to obtain 3=C. Decryption gives 3−18+26=11=K (IM p. 109).');
  card('cryptography', 'Which key conditions are required for a true one-time pad?',
    ['Secret, uniformly random, message-length key material that is never reused', 'A short public keyword reused for every message', 'A fixed Caesar shift for every user', 'Any password written twice'],
    'A true one-time pad needs fresh random secret material for each message. These practice ciphers are educational demonstrations.');
  card('cryptography', 'Why is Vigenère classified as polyalphabetic substitution?',
    ['The key position can select different letter shifts', 'It only changes letter order', 'It uses no key', 'It is a one-way hash'],
    'A repeating keyword selects shifts by position, so one plaintext letter can receive different substitutions.');
  card('cryptography', 'In the standard added Vigenère worksheet using A=0, how does the keyword align with the plaintext?',
    ['Repeat it over letters; spaces do not consume key positions', 'Use it once and discard the remaining plaintext', 'Advance it only at spaces', 'Always use A=1 instead'],
    'The added worksheet uses A=0 through Z=25 and repeats the keyword over message letters, ignoring spaces for alignment.', true);
  card('cryptography', 'Which statement correctly describes a cryptographic hash?',
    ['It produces a fixed-length digest and is not decrypted back into the input', 'It is a permutation with a secret position key', 'It always produces a unique output for every possible input', 'It is the same operation as Vigenère encryption'],
    'A hash maps inputs to a fixed-length digest. It is not reversible encryption, and collisions are possible.');

  // Unit I implementation and governance — 10 additional cards.
  card('implementation', 'Which list contains all six information-system components discussed in Unit I?',
    ['Software, hardware, data, people, procedures and networks', 'Only routers and firewalls', 'Only keys, certificates and hashes', 'Only programs and processors'],
    'The module treats an information system as technical assets together with the people, procedures and networks that make them useful.');
  card('implementation', 'Who initiates a top-down security implementation?',
    ['Upper management with policy, goals and resources', 'Only a volunteer technician', 'An external attacker', 'Only the firewall vendor'],
    'Top-down implementation begins with management support, accountability, a champion and dedicated resources.');
  card('implementation', 'Why can an unsupported bottom-up security effort struggle?',
    ['It can lack authority, funding and organizational staying power', 'It always has too much executive support', 'It eliminates technical expertise', 'It requires no maintenance'],
    'Unit I explains that technical initiative alone can lack the management support needed to sustain an organization-wide program.');
  card('implementation', 'Which SDLC phase defines the problem, scope and initial feasibility?',
    ['Investigation', 'Maintenance and change', 'Final decryption', 'Physical disposal only'],
    'Investigation establishes the problem, objectives, constraints and scope before the later design and implementation phases.');
  card('implementation', 'Which SecSDLC phase studies current threats, policies and risk?',
    ['Analysis', 'Output transformation', 'Certificate revocation', 'Implementation only'],
    'The analysis phase examines existing policies, current threats, relevant legal requirements and organizational risk.');
  card('implementation', 'Where does the SecSDLC develop its security blueprint and continuity plans?',
    ['Logical design', 'Only maintenance', 'Only procurement', 'Only account deletion'],
    'Logical design creates the blueprint and plans for incident response, business continuity and disaster recovery.');
  card('implementation', 'Evaluating specific security products against the blueprint belongs to which phase?',
    ['Physical design', 'Identification', 'Ciphertext analysis', 'Initial investigation only'],
    'Physical design evaluates actual technologies and physical safeguards that can implement the logical design.');
  card('implementation', 'Which phase acquires, tests and deploys security solutions and trains staff?',
    ['Implementation', 'Collision search', 'Passive eavesdropping', 'Key revocation only'],
    'Implementation puts the chosen solution into operation, tests it and addresses the personnel training needed to use it.');
  card('implementation', 'Why does the SecSDLC continue into maintenance and change?',
    ['Threats, systems and organizational needs keep changing', 'A deployed system cannot be altered', 'Testing ends every security risk', 'Policies are never revised'],
    'Maintenance adapts the security program as threats and systems evolve; deployment is not the end of the lifecycle.');
  card('implementation', 'A data owner decides protection requirements. What does a data custodian do?',
    ['Administers the safeguards that implement those requirements', 'Automatically owns all business data', 'Replaces all end users', 'Publishes every private key'],
    'Owners decide the required protection; custodians implement and administer technical safeguards while users follow approved practices.');

  // Unit IV symmetric systems, hashes and MACs — 15 additional cards.
  card('symmetric', 'What does a symmetric block cipher process at a time?',
    ['A fixed-size block using a shared secret key', 'A certificate authority only', 'An entire keyspace without a key', 'Only a public-key signature'],
    'Unit IV describes block ciphers as transforming fixed-size data blocks through keyed functions, with inverse processing for decryption.');
  card('symmetric', 'What are the DES block size and effective secret-key size?',
    ['64-bit block and 56 effective key bits', '128-bit block and 256 effective key bits', '56-bit block and 48 effective key bits', '64-bit block and no secret key'],
    'DES uses 64-bit blocks and 56 effective key bits. The PDF also mentions 48-bit round keys; those are not the master-key length.');
  card('symmetric', 'How many Feistel rounds does DES use?',
    ['16', '8', '10', '64'],
    'The DES discussion on PDF pp. 116–117 describes 16 Feistel rounds between the initial and final permutations.');
  card('symmetric', 'Which operation order describes the common Triple DES construction?',
    ['Encrypt, decrypt, encrypt with the selected keys', 'Hash, compress, delete', 'Only one DES encryption', 'Public-key sign, verify, sign'],
    'Triple DES applies the DES primitive three times, commonly using an encrypt–decrypt–encrypt construction. It is studied here as a historical design.');
  card('symmetric', 'According to the detailed IDEA section, what are its block and key sizes?',
    ['64-bit block and 128-bit key', '128-bit block and 28-bit key', '32-bit block and 56-bit key', '8-bit block with no key'],
    'PDF p. 119 gives a 64-bit input and a 128-bit key. The earlier 28-bit key wording is a typo, not the value used by the detailed explanation.');
  card('symmetric', 'How is the IDEA processing structure described in Unit IV?',
    ['Eight rounds followed by an output transformation', 'One Caesar shift only', 'Sixteen public-key exchanges', 'A certificate trust chain'],
    'IDEA applies eight rounds, using six subkeys per round, followed by an output transformation using four further subkeys.');
  card('symmetric', 'Which operations are central to RC5?',
    ['XOR, addition and data-dependent rotations', 'Only certificate signing', 'Only letter counting', 'Only a fixed alphabet replacement'],
    'The RC5 discussion uses XOR, modular addition and circular rotations, with configurable parameters such as rounds and key length.');
  card('symmetric', 'What is the AES block size regardless of the selected AES key length?',
    ['128 bits', '56 bits', '64 bits', '256 bits for every key'],
    'AES processes 128-bit blocks. Its supported key lengths are 128, 192 and 256 bits, distinct from its block size.');
  card('symmetric', 'How many rounds correspond to AES keys of 128, 192 and 256 bits?',
    ['10, 12 and 14 rounds', '8, 8 and 8 rounds', '16, 16 and 16 rounds', '128, 192 and 256 rounds'],
    'Added standard parameter detail: AES uses 10, 12 or 14 rounds for 128-, 192- or 256-bit keys. The PDF overview discusses key-dependent rounds without listing these counts.', true);
  card('symmetric', 'Which AES transformation combines the state with a round key using XOR?',
    ['AddRoundKey', 'ShiftRows', 'Certificate revocation', 'Diffie–Hellman'],
    'AddRoundKey XORs the state with round-key material; SubBytes, ShiftRows and MixColumns perform different transformations.');
  card('symmetric', 'Which mode encrypts blocks independently and can expose repeated plaintext-block patterns?',
    ['ECB', 'CBC', 'CFB', 'OFB'],
    'Electronic Codebook treats each block independently under one key, so repeated identical blocks produce repeated ciphertext blocks.');
  card('symmetric', 'In CBC encryption, what is combined with the first plaintext block?',
    ['An initialization vector', 'The recipient’s private signing key', 'A CRL entry', 'A biometric template'],
    'CBC uses an IV for the first block, then uses each preceding ciphertext block when processing the next plaintext block.');
  card('symmetric', 'Which mode encrypts successive counter values to create material XORed with plaintext?',
    ['CTR', 'ECB', 'A substitution alphabet', 'A trust chain'],
    'Counter mode generates a keystream from encrypted counter values and combines it with plaintext using XOR.');
  card('symmetric', 'What distinguishes a message authentication code from an ordinary unkeyed hash?',
    ['A MAC uses a shared secret key', 'A MAC always hides the plaintext', 'A MAC never checks integrity', 'A MAC is necessarily a public certificate'],
    'The module’s MAC process uses a message and secret key to create a tag that the receiver recomputes with the same key.');
  card('symmetric', 'Why does a shared-key MAC fail to provide third-party non-repudiation?',
    ['Both key holders can generate valid tags', 'It has no output', 'It always uses a public key', 'It automatically publishes the message'],
    'Because sender and receiver share the secret, a third party cannot uniquely attribute a valid MAC to one of them.');

  // Unit V public-key systems and signatures — 15 additional cards.
  card('public-key', 'For public-key confidentiality, which key encrypts for a recipient?',
    ['The recipient’s public key', 'The sender’s public key in every case', 'The recipient’s private key', 'The certificate database password'],
    'The sender encrypts for the recipient’s public key, and the corresponding private key is used to decrypt.');
  card('public-key', 'In the RSA classroom construction, how is n calculated?',
    ['Multiply the two selected primes p and q', 'Add the two public exponents', 'Hash the plaintext', 'Multiply every letter frequency'],
    'RSA key generation starts with distinct primes and forms the modulus n=pq for the public and private keys.');
  card('public-key', 'For p=7 and q=13, what is the RSA modulus?',
    ['91', '72', '20', '29'],
    'The PDF’s RSA example multiplies 7 by 13 to obtain n=91. The value 72 is its totient, not its modulus.');
  card('public-key', 'For distinct RSA primes p=7 and q=13, what is φ(n)?',
    ['72', '91', '20', '145'],
    'The totient is (p−1)(q−1)=6×12=72, which is used to select the public and private exponents.');
  card('public-key', 'What condition must RSA’s public exponent e satisfy in the module’s construction?',
    ['It is relatively prime to φ(n)', 'It must equal p', 'It must equal n', 'It must be the plaintext length'],
    'The public exponent must have a multiplicative inverse modulo φ(n), which requires gcd(e,φ(n))=1.');
  card('public-key', 'Why is d=29 suitable when e=5 and φ(n)=72?',
    ['5×29 leaves remainder 1 modulo 72', '5+29 equals 72', '29 is the same as the modulus 91', 'Every odd number is automatically valid'],
    'The exponent relationship is ed≡1 mod φ(n); 5×29=145=2×72+1 in the PDF example.');
  card('public-key', 'Which expression is textbook RSA encryption for message number m?',
    ['c=m^e mod n', 'c=m+e+n without reduction', 'c=hash(n) only', 'c=m^d without a modulus'],
    'The numerical exercise applies the public exponent and reduces modulo n. Real implementations also need secure parameters and padding.');
  card('public-key', 'In the PDF example n=91, e=5, what does message number 10 encrypt to?',
    ['82', '10', '29', '72'],
    '10^5 mod 91 is 82. The module then recovers 10 by computing 82^29 mod 91.');
  card('public-key', 'What does a basic Diffie–Hellman exchange establish?',
    ['A shared secret computed from each party’s private contribution', 'A signed certificate by itself', 'A decrypted document automatically', 'A public copy of both private exponents'],
    'Diffie–Hellman lets both sides derive the same secret without directly sending it; basic unauthenticated exchange does not prove identity.');
  card('public-key', 'Why do the two Diffie–Hellman computations agree?',
    ['Both yield g^(ab) modulo p', 'Both reveal the private exponents', 'Both ignore all exchanged values', 'Both hash the same certificate serial'],
    'Raising g^b to a or g^a to b gives the same modular value g^(ab), which forms the shared secret.');
  card('public-key', 'What form does an ElGamal ciphertext take in the module?',
    ['A pair of values (C1,C2)', 'A certificate serial number only', 'A single unkeyed hash always', 'A Caesar shift count only'],
    'ElGamal encryption uses fresh randomness and produces two components; decryption uses the recipient’s private value.');
  card('public-key', 'Why does ElGamal select a fresh random k for encryption?',
    ['To randomize the encryption computation', 'To publish the private key', 'To eliminate the modulus', 'To replace the message with a certificate'],
    'The random encryption value k contributes to both ciphertext components and should be freshly selected for the operation.');
  card('public-key', 'What mathematical setting does elliptic-curve cryptography use?',
    ['Operations on points of an elliptic curve', 'Only a 26-letter alphabet wheel', 'Only DES permutation tables', 'Only biometric fingerprints'],
    'ECC defines operations on elliptic-curve points and uses related hard mathematical problems for public-key schemes.');
  card('public-key', 'Which pair in Unit V consists of digital-signature schemes?',
    ['DSA and Schnorr', 'ECB and CBC', 'NAT and PAT', 'FAR and FRR'],
    'Unit V discusses the Digital Signature Algorithm and Schnorr signatures; these authenticate signed data rather than serving as block-cipher modes.');
  card('public-key', 'Which key roles apply to a digital signature?',
    ['Create with the private signing key; verify with the public key', 'Create with every user’s public key; verify with a password', 'Create without a key; decrypt with a hash', 'Create with an IV; verify with a port number'],
    'A private signing key creates signatures, and the corresponding authenticated public key verifies them. Signing does not itself hide the message.');

  // Unit VI PKI — 10 additional cards.
  card('pki', 'What binding does a digital certificate establish?',
    ['An identity to a public key', 'A private key to every anonymous visitor', 'A plaintext to one unique hash forever', 'An IP address to an AES round count'],
    'A certificate is a signed assertion connecting identity information with a public key, subject to its validity and trust requirements.');
  card('pki', 'Which PKI role signs and issues certificates?',
    ['Certificate authority', 'Packet sniffer', 'Data-dependent rotation', 'Counter register'],
    'A CA signs certificate assertions so relying parties can verify the issuer and the binding it makes.');
  card('pki', 'What is a registration authority’s role?',
    ['Verify the identity of certificate applicants', 'Decrypt all HTTPS messages', 'Store every user’s private key publicly', 'Choose every network route'],
    'The RA checks applicant identity for the certification process; a CA may perform this role itself or use another authority.');
  card('pki', 'What does a certificate repository store?',
    ['Certificates and related metadata', 'Only plaintext passwords', 'Every session’s unencrypted traffic', 'Only random pad characters'],
    'The PDF lists a database or repository for certificates and metadata such as validity periods as one component of PKI.');
  card('pki', 'What is the purpose of validating a certificate trust chain?',
    ['Connect the certificate through trusted issuers to a trusted root', 'Recover the signer’s private key', 'Remove every expiration date', 'Replace identity checking with encryption alone'],
    'Validation checks the chain of issuer signatures and applicable constraints rather than trusting an arbitrary public key.');
  card('pki', 'Which certificate format is discussed for PKI and secure email?',
    ['X.509', 'ASCII-only Caesar', 'ECB', 'A raw one-time pad'],
    'Unit VI describes X.509 certificates for common PKI uses, including S/MIME signed and encrypted email.');
  card('pki', 'Can a certificate be unexpired and still revoked?',
    ['Yes, for example after its private key is compromised', 'No, dates always override revocation', 'Only if it has no public key', 'Only when it uses a Caesar shift'],
    'Revocation can invalidate a certificate before its scheduled expiration, especially when the associated private key is compromised.');
  card('pki', 'What is a certificate revocation list?',
    ['An issuer-signed list identifying revoked certificates', 'A public list of users’ private keys', 'A list of ciphertext letters', 'A tool that recovers forgotten passwords'],
    'A CRL lists revoked certificate serial numbers and associated revocation information and is signed by the issuer.');
  card('pki', 'Which mechanism requests a certificate’s status instead of downloading a complete CRL?',
    ['OCSP', 'IDEA', 'PAT', 'TBAC'],
    'The Online Certificate Status Protocol provides certificate status responses such as good, revoked or unknown.');
  card('pki', 'What happens with OCSP stapling?',
    ['The server supplies an authority-signed status response with its certificate exchange', 'The browser publishes its private key', 'The CA encrypts every web page', 'The certificate never expires'],
    'Stapling lets the server supply a signed status response, reducing separate client requests to the status responder.');

  // Unit VII attacks and defenses — 10 additional cards.
  card('attacks', 'Which situation is a passive attack?',
    ['Eavesdropping without modifying the communication', 'Deleting a stored message', 'Injecting forged authentication', 'Blocking a service'],
    'Passive attacks observe or collect information while leaving the communication and information unchanged.');
  card('attacks', 'Which action is an active attack?',
    ['Altering a message or denying access to a service', 'Only listening to a transmission', 'Only reading a public manual', 'Only counting public algorithm names'],
    'Active attacks modify, inject, delete or disrupt information or access, rather than only observing it.');
  card('attacks', 'What does a brute-force key search do?',
    ['Test candidate keys systematically', 'Guarantee instant decryption of every cipher', 'Require the private key beforehand', 'Only revoke certificates'],
    'Brute force searches the keyspace; its feasibility depends on the keyspace, resources and implementation.');
  card('attacks', 'What evidence does a known-plaintext attack use?',
    ['Known plaintext together with its corresponding ciphertext', 'Only a list of revoked certificates', 'Only a firewall state table', 'Only an unrelated password'],
    'A known-plaintext attacker has message and ciphertext pairs that can expose information about the target cryptosystem.');
  card('attacks', 'What distinguishes the module’s selected-plaintext attack?',
    ['The attacker obtains encryption of chosen message content', 'The attacker never knows any plaintext', 'The attack must use a physical door', 'The attack only changes a CRL'],
    'Selected-plaintext, often called chosen-plaintext, involves obtaining encrypted results for attacker-selected message content.');
  card('attacks', 'How can a man-in-the-middle attack undermine an unauthenticated key exchange?',
    ['Substitute keys and relay separate conversations with each party', 'Always factor every large modulus instantly', 'Delete the existence of encryption', 'Turn every ciphertext into a unique digest'],
    'An attacker can replace key material and relay communication. The identity of exchanged public keys must be authenticated.');
  card('attacks', 'What does a correlation attack seek?',
    ['Statistical relationships involving key structure and ciphertext', 'Only a physical keycard serial number', 'Only a certificate’s expiry date', 'Only the name of a firewall vendor'],
    'The module describes correlation methods as searching for useful statistical relationships in cryptographic data.');
  card('attacks', 'What does a dictionary attack test?',
    ['Likely words or candidate secrets against a target verification value', 'Only every possible network cable', 'Only the dates in a certificate', 'Only binary transposition positions'],
    'Dictionary attacks try likely secrets, for example by computing candidate password-verification values and comparing them with stolen values.');
  card('attacks', 'Which attack analyzes variations in observed processing or interaction time?',
    ['Timing attack', 'Certificate issuance', 'CBC chaining', 'Biometric enrollment'],
    'Timing attacks infer sensitive information from observable timing behavior rather than directly reading the secret key.');
  card('attacks', 'Why should an organization plan authorized key recovery?',
    ['Lost passphrases or departed staff can otherwise make encrypted data unavailable', 'Every strong cipher is instantly reversible without a key', 'Public certificates contain all private keys', 'Recovery eliminates the need to protect keys'],
    'The Unit VII case study shows that effective encryption must be accompanied by controlled key management and recovery planning.');

  global.CipherLabStudyBank = { sources, topics, cards };
})(window);
