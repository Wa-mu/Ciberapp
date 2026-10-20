/* Study content summarized from the supplied INTE 401 reviewer, October 2026. */
(function (global) {
  'use strict';
  const filename = 'INTE_401_Information_Assurance_Security_2_Reviewer.pdf';
  const topics = [
    { id: 'access', name: 'Access control', section: '1', pages: '2–3' },
    { id: 'firewalls', name: 'Firewalls & network protection', section: '2', pages: '3–4' },
    { id: 'remote', name: 'Remote connections', section: '3', pages: '5' },
    { id: 'controls', name: 'Security controls', section: '4', pages: '5–6' },
    { id: 'idps', name: 'Intrusion detection & prevention', section: '5', pages: '6–7' },
    { id: 'honeypots', name: 'Honeypots & honeynets', section: '6', pages: '7' },
    { id: 'scanning', name: 'Scanning & analysis tools', section: '7', pages: '7–8' },
    { id: 'biometrics', name: 'Biometric access control', section: '8', pages: '8' },
    { id: 'cryptography', name: 'Cryptography', section: '9–13', pages: '8–11' },
  ];
  const source = (id) => {
    const topic = topics.find((item) => item.id === id);
    return `Reviewer §${topic.section}, pp. ${topic.pages}`;
  };
  const lesson = (id, name, summary, bullets, formula, example, trap) => ({
    id, name, topic: id, source: `CORE · ${source(id)}`, level: 'CORE',
    summary, bullets, formula, example, trap,
  });
  const lessons = [
    lesson('access', 'Access control & authentication',
      'Access control applies a policy to decide whether a subject may perform an action on an object. Identity checks and permission checks answer different questions.',
      [
        'IAAA: identification claims an identity; authentication verifies it; authorization checks rights; accountability traces actions through audit records.',
        'Authentication factors: something you know (password), have (security key), or are (fingerprint). Two passwords still use one factor category.',
        'DAC: resource owner decides. MAC: central clearance/classification policy. RBAC: job role. TBAC: temporary task. ABAC: subject, object and context attributes.',
        'Least privilege grants only necessary rights. Separation of duties assigns sensitive steps to different people.',
        'The reviewer marks theoretical-model depth as BONUS: Bell-LaPadula protects confidentiality; Biba protects integrity; Clark-Wilson uses controlled transactions; Brewer-Nash addresses conflicts of interest.',
      ],
      'IDENTIFY → AUTHENTICATE → AUTHORIZE → ACCOUNT\nDAC = owner; MAC = classification; RBAC = role\nTBAC = task; ABAC = attributes',
      'A clerk can sign in but cannot approve payroll: authentication succeeded; authorization denies the action.',
      'A password plus a PIN is two knowledge secrets, not two different authentication factors.'),
    lesson('firewalls', 'Firewalls & network protection',
      'A firewall enforces traffic rules across a trust boundary. Its placement and inspection method determine what it can observe and permit.',
      [
        'Static packet filters inspect addresses, protocols and ports using ACLs. Dynamic filters adjust temporary rules as events or traffic change.',
        'Stateful inspection adds a connection-state table. An application proxy intermediates application requests.',
        'Default deny rejects traffic without an explicit allow rule. ACLs describe which traffic is allowed or denied.',
        'A DMZ separates public services from the internal LAN. A bastion host is hardened; a dual-homed host has two network interfaces.',
        'NAT translates addresses; PAT distinguishes shared-public-IP sessions using ports. Translation alone is not a complete security control.',
        'Historical blanket rules in the module need context: required outbound traffic and ICMP should be evaluated against a least-privilege policy.',
      ],
      'INTERNET → [DMZ: public web service] → [restricted application path]\nINTERNET → internal database: DENY\nUnlisted flow: DENY',
      'Permit public HTTPS to the web tier, allow only necessary application-to-database traffic, and deny public database access.',
      'A stateful firewall tracks connections; NAT/PAT describes address and port translation.'),
    lesson('remote', 'Protecting remote connections',
      'Remote access extends connectivity beyond the local network. Protect it with verified identity, restricted permissions, secure communication and useful logs.',
      [
        'Layer MFA, device checks, least privilege, session timeouts and logging to address stolen credentials and unmanaged devices.',
        'RADIUS centralizes authentication, authorization and accounting (AAA), commonly for network access.',
        'TACACS+ provides centralized AAA and can support granular network-device command authorization.',
        'Kerberos uses a Key Distribution Center (KDC) and tickets: first a ticket-granting ticket, then a service ticket.',
        'A remote-access VPN connects a user/device to a private network; a site-to-site VPN connects networks.',
      ],
      'KERBEROS: authenticate → TGT → service ticket → service\nREMOTE ACCESS: user/device ↔ private network\nSITE TO SITE: network ↔ network',
      'An administrator connects through a VPN, proves identity with MFA and receives only the management rights required for the job.',
      'A VPN supplies a tunnel; RADIUS and TACACS+ supply AAA services. They solve different parts of remote access.'),
    lesson('controls', 'Security controls & defense in depth',
      'Security controls protect confidentiality, integrity and availability. The reviewer adds a BONUS classification by implementation and function to support scenario questions.',
      [
        'Confidentiality restricts disclosure; integrity protects trustworthy data; availability keeps services usable when needed.',
        'Implementation categories: administrative policies and procedures, technical safeguards, and physical safeguards.',
        'Preventive controls reduce incident likelihood; detective controls reveal events; corrective controls repair after detection.',
        'Recovery controls restore service; deterrent controls discourage misuse; compensating controls provide an alternative safeguard.',
        'Defense in depth combines complementary controls so that different failure modes have different safeguards.',
      ],
      'CIA = CONFIDENTIALITY + INTEGRITY + AVAILABILITY\nPREVENT → DETECT → CORRECT → RECOVER\nControl-function taxonomy: BONUS explanation',
      'Combine RBAC, MFA, segmentation, audit trails and encrypted backups around a sensitive database.',
      'An IDS alert detects activity. A tested backup restore recovers service. Classify the action described in the scenario.'),
    lesson('idps', 'Intrusion detection & prevention',
      'An IDS observes suspicious activity and alerts. An IPS can take preventive action, such as dropping traffic. IDPS covers both detection and prevention.',
      [
        'NIDS/NIPS examines network traffic. HIDS/HIPS observes local files, processes, logs and host activity.',
        'Passive deployment observes, often from mirrored traffic. Inline deployment lies on the traffic path and can enforce a block.',
        'Signature detection matches known patterns; anomaly detection finds baseline deviations; stateful protocol analysis checks valid protocol behavior.',
        'True positive: attack alerted. False negative: attack missed. False positive: harmless activity alerted. True negative: harmless activity correctly ignored.',
        'Tuning adjusts rules and thresholds; clustering groups similar alerts; filtering suppresses or classifies selected alerts. Placement affects visibility.',
      ],
      '                 ALERT          NO ALERT\nATTACK           True positive  False negative\nNO ATTACK        False positive True negative',
      'A routine backup triggers an attack alarm: false positive. An actual intrusion with no alarm: false negative.',
      'Anomaly detection can discover unfamiliar behavior, but a deviation does not prove an attack.'),
    lesson('honeypots', 'Honeypots, honeynets & padded cells',
      'Deception environments attract and record suspicious interactions. They support observation and containment when isolated and monitored.',
      [
        'A honeypot is a decoy system or service; a honeynet is a controlled network of decoys.',
        'A padded cell is an isolated environment to which suspicious activity can be directed for observation and containment.',
        'Decoys can capture attempted commands and tactics or divert attention from production assets.',
        'Poor isolation can expose real systems. A decoy does not directly protect every production resource.',
        'BONUS: low-interaction decoys emulate limited services; high-interaction environments offer realism and richer evidence with greater operational risk.',
      ],
      'HONEYPOT = decoy system/service\nHONEYNET = network of decoys\nPADDED CELL = isolated observation environment',
      'An isolated fake service records unexpected login attempts while production systems remain segmented.',
      'Observation of an attacker does not authorize retaliation. Decoys need containment and monitoring.'),
    lesson('scanning', 'Scanning & analysis tools',
      'Select an assessment tool by the question it answers. Discovery, traffic inspection and vulnerability assessment produce different kinds of evidence.',
      [
        'Footprinting gathers publicly visible organizational information; fingerprinting identifies technologies, operating systems or service versions.',
        'Port scanners discover reachable services; vulnerability scanners identify evidence of known weaknesses or misconfiguration.',
        'Packet/protocol analyzers inspect captured traffic. Wireless analyzers examine the wireless environment.',
        'Active scanning sends probes; passive analysis observes existing traffic or configuration without initiating network probes.',
        'Define authorization, targets and a test window; scan conservatively, validate findings, prioritize, remediate and rescan.',
      ],
      'AUTHORIZE → SCOPE → SCAN → VALIDATE → PRIORITIZE → FIX → RESCAN\nPort scanner: what is reachable?\nPacket analyzer: what does captured traffic contain?',
      'A packet analyzer explains captured protocol fields; a vulnerability scanner flags a potentially outdated service for validation.',
      'An open port is not automatically a vulnerability, and a scanner finding is not proof of successful exploitation.'),
    lesson('biometrics', 'Biometric access control',
      'Biometric matching compares features from a captured human characteristic against an enrolled template. Thresholds balance security and user friction.',
      [
        'Physiological examples include fingerprint, iris, face and hand geometry. Behavioral examples include keystroke rhythm and signature dynamics.',
        'The process captures a sample, extracts features and compares the resulting template with an enrolled reference.',
        'FAR: an unauthorized claimant is accepted. FRR: a legitimate user is rejected.',
        'CER/EER is the operating point where false acceptance and false rejection rates are equal.',
        'A stricter matching threshold usually reduces false acceptance while increasing false rejection.',
        'Course terminology: false reject is Type I; false accept is Type II. Always identify the underlying event before assigning an error label.',
      ],
      'CAPTURE → EXTRACT FEATURES → COMPARE TEMPLATE → DECIDE\nFAR = impostor accepted; FRR = valid user rejected\nCER/EER: FAR = FRR at the chosen operating point',
      'The enrolled employee is refused access: false reject (FRR). An impostor is admitted: false accept (FAR).',
      'A biometric template is sensitive identity data. Raising the match threshold involves a security/usability trade-off.'),
  ];
  const questions = [];
  const question = (topic, q, a, c, exp, tag = 'CORE') =>
    questions.push({ topic, q, a, c, exp, tag, source: source(topic) });

  question('access', 'A signed-in employee cannot approve a purchase. Which function checks that permission?',
    ['Identification', 'Authorization', 'Encryption', 'Authentication'], 1,
    'Authorization checks allowed actions after the identity has been authenticated.');
  question('access', 'Which pair uses two different authentication factor categories?',
    ['Password and PIN', 'Two passwords', 'Security key and password', 'Username and employee number'], 2,
    'A security key is a possession factor; a password is a knowledge factor.');
  question('access', 'Which access model lets a resource owner choose who may read a file?',
    ['MAC', 'RBAC', 'ABAC', 'DAC'], 3, 'DAC places sharing discretion with the owner.');
  question('access', 'A policy checks job role, device trust and time of day. Which model best fits?',
    ['ABAC', 'Caesar', 'DAC only', 'PAT'], 0, 'ABAC evaluates subject, resource and context attributes.');
  question('access', 'Which model ties permissions to an assigned workflow step?',
    ['RBAC only', 'TBAC', 'NAT', 'HIDS'], 1, 'Task-based access control grants rights for a task or workflow step.');
  question('access', 'Which theoretical model uses “no read up, no write down” to protect confidentiality?',
    ['Biba', 'Clark-Wilson', 'Bell-LaPadula', 'Brewer-Nash'], 2,
    'Bell-LaPadula restricts information flow to protect confidentiality. The reviewer labels this theoretical depth BONUS.', 'BONUS');
  question('access', 'Which theoretical model uses “no read down, no write up” to protect integrity?',
    ['Biba', 'Bell-LaPadula', 'DAC', 'Kerberos'], 0,
    'Biba protects high-integrity data from lower-integrity contamination. This is BONUS theoretical depth.', 'BONUS');
  question('firewalls', 'What extra context does a stateful firewall maintain?',
    ['Biometric templates', 'One-time pads', 'Connection state', 'Employee roles'], 2,
    'A state table associates packets with tracked network conversations.');
  question('firewalls', 'Where should a public web tier be placed to separate it from an internal LAN?',
    ['In every employee folder', 'In a DMZ', 'In a password database', 'In a biometric template'], 1,
    'A DMZ hosts exposed services in an intermediate network with restricted internal access.');
  question('firewalls', 'What does default deny mean for an unlisted traffic flow?',
    ['Allow it if outbound', 'Translate its address', 'Trust it automatically', 'Reject it unless explicitly allowed'], 3,
    'Default deny requires an explicit permission before a flow is accepted.');
  question('firewalls', 'Which mechanism lets multiple sessions share a public IP using distinct port mappings?',
    ['PAT', 'HIDS', 'RBAC', 'FRR'], 0, 'Port Address Translation distinguishes sessions through port mappings.');
  question('remote', 'Which service commonly centralizes AAA for network access?',
    ['DNS', 'RADIUS', 'HTTP', 'A Caesar cipher'], 1,
    'RADIUS commonly supplies centralized authentication, authorization and accounting for network access.');
  question('remote', 'What are the central components of Kerberos authentication?',
    ['Public web pages and hashes', 'Port scans and alerts', 'A KDC and tickets', 'A repeated alphabet keyword'], 2,
    'Kerberos uses a Key Distribution Center, a ticket-granting ticket and service tickets.');
  question('remote', 'Which VPN arrangement connects two organizational networks?',
    ['A flashcard session', 'Host-only logging', 'A biometric match', 'Site-to-site VPN'], 3,
    'Site-to-site VPNs connect networks; remote-access VPNs connect users or devices to a private network.');
  question('remote', 'Which AAA system is especially associated with network-device command authorization?',
    ['TACACS+', 'PAT', 'XOR', 'CER'], 0,
    'TACACS+ is commonly used for granular administrative access to network devices.');
  question('controls', 'Which CIA property concerns service access when it is needed?',
    ['Confidentiality', 'Integrity', 'Availability', 'Identification'], 2,
    'Availability concerns timely access to usable data and services.');
  question('controls', 'An audit alert identifies suspicious sign-ins. What function does it perform?',
    ['Recovery', 'Detective', 'Deterrent only', 'Corrective only'], 1,
    'The alert detects an event. The reviewer labels this control-function taxonomy as supplemental exam preparation.', 'BONUS');
  question('controls', 'Restoring a tested backup after an outage is primarily which control function?',
    ['Preventive', 'Identification', 'Deterrent', 'Recovery'], 3,
    'Restoration recovers service after disruption; the function taxonomy is BONUS in the reviewer.', 'BONUS');
  question('controls', 'What best illustrates defense in depth?',
    ['RBAC, MFA, segmentation, audit trails and backups together', 'One reused password everywhere', 'Disabling all logs', 'A firewall replacing every other safeguard'], 0,
    'Complementary safeguards address different failure modes instead of depending on one barrier.');
  question('idps', 'Which capability distinguishes an IPS from a purely alerting IDS?',
    ['It removes every threat', 'It replaces backups', 'It can block detected traffic', 'It never requires tuning'], 2,
    'An IPS can take preventive action, such as dropping a malicious packet.');
  question('idps', 'Which sensor directly observes local file integrity changes?',
    ['NIDS only', 'HIDS', 'PAT', 'A public DNS record'], 1,
    'A host-based sensor monitors local files, processes and logs.');
  question('idps', 'A detector matches a known malicious byte pattern. Which method is this?',
    ['Anomaly detection', 'Transposition', 'Authentication', 'Signature detection'], 3,
    'Signature detection matches known indicators or attack patterns.');
  question('idps', 'A genuine intrusion produces no alert. How is that outcome classified?',
    ['False negative', 'False positive', 'True positive', 'True negative'], 0,
    'A false negative misses an actual attack. A false positive instead alerts on harmless activity.');
  question('idps', 'Normal backup traffic is incorrectly flagged as an attack. What is this?',
    ['True negative', 'True positive', 'False positive', 'False negative'], 2,
    'A false positive is a false alarm on legitimate activity.');
  question('honeypots', 'What distinguishes a honeynet from a honeypot?',
    ['It uses no monitoring', 'It contains a network of decoys', 'It is a biometric factor', 'It is a cryptographic key'], 1,
    'A honeynet combines decoy systems in a controlled network.');
  question('honeypots', 'What is the purpose of a padded cell in the reviewer?',
    ['Share production passwords', 'Replace all firewalls', 'Publish private keys', 'Isolate suspicious activity for observation'], 3,
    'A padded cell provides a contained environment for suspicious interactions.');
  question('honeypots', 'Why must a decoy environment be isolated from production?',
    ['Poor containment can expose real systems', 'Decoys cannot produce logs', 'Isolation decrypts traffic', 'A honeypot is an authentication factor'], 0,
    'A compromised, poorly isolated decoy can create risk for actual assets.');
  question('scanning', 'Which tool is suited to examining fields in captured network frames?',
    ['A role manager', 'A pad generator', 'A packet/protocol analyzer', 'A biometric matcher'], 2,
    'A packet analyzer decodes observed network traffic and protocol fields.');
  question('scanning', 'A scanner sends probes to discover reachable ports. Which description fits?',
    ['Passive observation', 'Active scanning', 'Encryption', 'Accountability only'], 1,
    'Sending discovery probes is active scanning and may affect the target environment.');
  question('scanning', 'A scanner reports an outdated service. What should happen before treating the result as confirmed exploitation?',
    ['Assume all data was stolen', 'Delete the report', 'Ignore its exposure', 'Validate the finding and assess risk'], 3,
    'A scanner flags evidence of a potential weakness; validation and exposure determine its significance.');
  question('biometrics', 'An impostor is incorrectly admitted by a biometric system. Which metric applies?',
    ['FAR: false acceptance', 'FRR: false rejection', 'True negative', 'Collision resistance'], 0,
    'FAR measures unauthorized claimants accepted; the course calls a false accept Type II.');
  question('biometrics', 'A legitimate enrolled user is refused access. Which event occurred?',
    ['False accept', 'True positive', 'False reject', 'Successful authorization'], 2,
    'FRR concerns legitimate users incorrectly rejected; the course calls this Type I.');
  question('biometrics', 'What does CER/EER identify?',
    ['The total number of users', 'The operating point where FAR and FRR are equal', 'A public-key size', 'A firewall port'], 1,
    'The crossover/equal error rate describes equal false-accept and false-reject rates at an operating point.');
  question('biometrics', 'What usually happens when a biometric match threshold becomes stricter?',
    ['Both error rates must vanish', 'More impostors are accepted', 'Templates are no longer needed', 'False accepts decrease while false rejects may increase'], 3,
    'A stricter match requirement usually improves rejection of impostors at a usability cost.');

  // These cards are appended after the original cards so saved mastery indices remain valid.
  const flashcards = [
    ['What does IAAA stand for?', 'Identification, authentication, authorization and accountability.'],
    ['Authentication vs authorization?', 'Authentication verifies identity; authorization checks permitted actions.'],
    ['What are the three authentication factor categories?', 'Something you know, something you have and something you are.'],
    ['DAC, MAC and RBAC?', 'DAC: owner discretion. MAC: central classification policy. RBAC: assigned job role.'],
    ['TBAC vs ABAC?', 'TBAC follows a task/workflow; ABAC evaluates subject, object and context attributes.'],
    ['What is least privilege?', 'Grant only the access necessary to perform the required work.'],
    ['What does a stateful firewall track?', 'Connection state, using a table of active conversations.'],
    ['What is a DMZ?', 'An intermediate network for exposed services, separated from internal resources.'],
    ['What is default deny?', 'Reject traffic or access without an explicit allow rule.'],
    ['NAT vs PAT?', 'NAT translates addresses; PAT uses ports to distinguish sessions sharing an address.'],
    ['What does RADIUS provide?', 'Centralized authentication, authorization and accounting, commonly for network access.'],
    ['What does Kerberos use?', 'A Key Distribution Center and tickets, including a ticket-granting ticket and service tickets.'],
    ['Remote-access vs site-to-site VPN?', 'Remote access connects a user/device; site-to-site connects networks.'],
    ['What are the CIA objectives?', 'Confidentiality, integrity and availability.'],
    ['What is defense in depth?', 'Multiple complementary safeguards addressing different failure modes.'],
    ['IDS vs IPS?', 'IDS observes and alerts; IPS can actively block or otherwise prevent detected activity.'],
    ['NIDS vs HIDS?', 'NIDS monitors network traffic; HIDS monitors local files, logs, processes and host activity.'],
    ['Signature vs anomaly detection?', 'Signature detection matches known patterns; anomaly detection identifies baseline deviations.'],
    ['False positive vs false negative in detection?', 'False positive: harmless activity alerted. False negative: actual attack missed.'],
    ['Honeypot vs honeynet?', 'A honeypot is a decoy system or service; a honeynet is a controlled network of decoys.'],
    ['What is a padded cell?', 'An isolated environment for observing and containing suspicious activity.'],
    ['Active vs passive scanning?', 'Active scanning sends probes; passive analysis observes existing traffic or configuration.'],
    ['Port scanner vs packet analyzer?', 'A port scanner discovers reachable services; a packet analyzer inspects captured traffic.'],
    ['FAR vs FRR?', 'False accept: impostor admitted. False reject: legitimate user refused.'],
    ['What is CER/EER?', 'The operating point at which false acceptance and false rejection rates are equal.'],
    ['Which biometric errors are Type I and Type II in the course?', 'Type I: false reject. Type II: false accept.'],
  ];
  global.CipherLabReviewer = { filename, topics, source, lessons, questions, flashcards };
})(typeof window === 'undefined' ? globalThis : window);
