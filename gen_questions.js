/* ============================================================
   gen_questions.js — builds window.QUESTION_BANK (1000+ unique
   CS-fundamentals MCQs) and writes questions.js.
   Every stem embeds its distinguishing detail, so no two share a
   stem, and each question has exactly one clearly-correct answer.
   Run: node gen_questions.js
   ============================================================ */
"use strict";
const fs = require("fs");
const BANK = [];
const stemSet = new Set();

function hashStr(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h>>>0;}
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function pickDistractors(pool, correct, need, seedStr){
  const rng = mulberry32(hashStr(seedStr));
  const cand = pool.filter(v => String(v) !== String(correct));
  const uniq = []; const seen = new Set();
  for (const v of cand){ const s=String(v); if(seen.has(s))continue; seen.add(s); uniq.push(v); }
  const idxs = uniq.map((_, i) => i);
  for (let i = idxs.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idxs[i], idxs[j]] = [idxs[j], idxs[i]]; }
  return idxs.slice(0, need).map(i => uniq[i]);
}
function orderAndPush(cat, q, opts, correct){
  const rng = mulberry32(hashStr("order|" + q));
  for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  const a = opts.map(String).indexOf(String(correct));
  const key = q.trim().toLowerCase();
  if (stemSet.has(key)) throw new Error("Duplicate stem: " + q);
  stemSet.add(key);
  BANK.push({ cat, q, opts: opts.map(String), a });
}
/* pool = distractor source (every pool member must be a WRONG answer here). */
function addMC(cat, q, correct, pool){
  const wrong = pickDistractors(pool, correct, 3, cat + "|" + q);
  if (wrong.length < 3) throw new Error("Not enough distractors: " + q + " (pool " + pool.length + ")");
  orderAndPush(cat, q, [correct, ...wrong], correct);
}
/* explicit 3 wrong options. */
function add(cat, q, correct, wrongs){
  const uniq = []; const seen = new Set([String(correct)]);
  for (const w of wrongs){ const s = String(w); if (seen.has(s)) continue; seen.add(s); uniq.push(w); }
  if (uniq.length < 3) throw new Error("Need 3 distinct wrongs: " + q);
  orderAndPush(cat, q, [correct, uniq[0], uniq[1], uniq[2]], correct);
}

const CPX = ["O(1)","O(log n)","O(n)","O(n log n)","O(n\u00b2)","O(n\u00b3)","O(2\u207f)","O(n!)","O(m)","O(V+E)","O(V\u00b2)","O(n + k)"];

/* ============ SECTION 1 — BIG-O TABLES (avg/best/worst + space) ============ */
(function bigO(){
  const cat = "Algorithms & Complexity";
  // {opName: [best, avg, worst]}  (null -> skip that case)
  const structures = {
    "an unsorted array": { access:["O(1)","O(1)","O(1)"], search:["O(1)","O(n)","O(n)"], "insertion at the end":["O(1)","O(1)","O(n)"], "insertion in the middle":[null,"O(n)","O(n)"], deletion:["O(1)","O(n)","O(n)"] },
    "a sorted array": { access:["O(1)","O(1)","O(1)"], search:["O(1)","O(log n)","O(log n)"], "binary-search insertion":[null,"O(n)","O(n)"], deletion:["O(1)","O(n)","O(n)"] },
    "a singly linked list": { access:["O(1)","O(n)","O(n)"], search:["O(1)","O(n)","O(n)"], "insertion at the head":["O(1)","O(1)","O(1)"], deletion:["O(1)","O(n)","O(n)"] },
    "a doubly linked list": { access:["O(1)","O(n)","O(n)"], search:["O(1)","O(n)","O(n)"], "insertion at the head":["O(1)","O(1)","O(1)"], "deletion of a known node":["O(1)","O(1)","O(1)"] },
    "a stack": { "peek at the top":["O(1)","O(1)","O(1)"], push:["O(1)","O(1)","O(1)"], pop:["O(1)","O(1)","O(1)"], search:["O(1)","O(n)","O(n)"] },
    "a queue": { "peek at the front":["O(1)","O(1)","O(1)"], "enqueue":["O(1)","O(1)","O(1)"], "dequeue":["O(1)","O(1)","O(1)"], search:["O(1)","O(n)","O(n)"] },
    "a hash table": { access:["O(1)","O(1)","O(n)"], search:["O(1)","O(1)","O(n)"], insertion:["O(1)","O(1)","O(n)"], deletion:["O(1)","O(1)","O(n)"] },
    "a balanced binary search tree": { access:["O(1)","O(log n)","O(log n)"], search:["O(1)","O(log n)","O(log n)"], insertion:["O(log n)","O(log n)","O(log n)"], deletion:["O(log n)","O(log n)","O(log n)"] },
    "an AVL tree": { search:["O(1)","O(log n)","O(log n)"], insertion:["O(log n)","O(log n)","O(log n)"], deletion:["O(log n)","O(log n)","O(log n)"] },
    "a red-black tree": { search:["O(1)","O(log n)","O(log n)"], insertion:["O(log n)","O(log n)","O(log n)"], deletion:["O(log n)","O(log n)","O(log n)"] },
    "a skip list": { search:["O(1)","O(log n)","O(n)"], insertion:["O(1)","O(log n)","O(n)"], deletion:["O(1)","O(log n)","O(n)"] },
    "a binary heap": { "find-minimum":["O(1)","O(1)","O(1)"], insertion:["O(1)","O(log n)","O(log n)"], "delete-root":["O(1)","O(log n)","O(log n)"], search:["O(1)","O(n)","O(n)"] },
    "a graph as an adjacency list": { "iterate a vertex's edges":["O(1)","O(deg)","O(V)"], "add an edge":["O(1)","O(1)","O(1)"], "check an edge":["O(1)","O(deg)","O(V)"] },
    "a graph as an adjacency matrix": { "check an edge":["O(1)","O(1)","O(1)"], "add an edge":["O(1)","O(1)","O(1)"], "iterate a vertex's edges":[null,"O(V)","O(V)"] },
    "a trie": { "insert a key of length m":["O(m)","O(m)","O(m)"], "search a key of length m":["O(m)","O(m)","O(m)"] }
  };
  const caseName = { 0:"Best-case", 1:"Average-case", 2:"Worst-case" };
  for (const ds in structures){
    for (const op in structures[ds]){
      const vals = structures[ds][op];
      for (let ci = 0; ci < 3; ci++){
        if (!vals[ci]) continue;
        addMC(cat, `${caseName[ci]} time complexity of ${op} in ${ds}?`, vals[ci], CPX);
      }
    }
  }
  // special named facts
  addMC(cat, "Time complexity of Floyd's linear build-heap on n elements?", "O(n)", CPX);
  addMC(cat, "Time complexity of binary search on a sorted array?", "O(log n)", CPX);
  addMC(cat, "Time complexity of linear search on an unsorted array?", "O(n)", CPX);
  addMC(cat, "Amortized time complexity of appending to a dynamic array?", "O(1)", CPX);
  addMC(cat, "Worst-case time complexity of quicksort with a bad pivot every time?", "O(n\u00b2)", CPX);

  // space complexity of structures
  const space = { "an array":"O(n)", "a singly linked list":"O(n)", "a stack":"O(n)", "a queue":"O(n)",
    "a hash table":"O(n)", "a binary search tree":"O(n)", "an AVL tree":"O(n)", "a binary heap":"O(n)",
    "a skip list":"O(n)", "a graph as an adjacency list":"O(V + E)", "a graph as an adjacency matrix":"O(V\u00b2)",
    "a segment tree":"O(n)", "a 2D matrix of size n\u00d7n":"O(n\u00b2)" };
  for (const ds in space) addMC(cat, `Auxiliary space to store ${ds} holding n elements?`, space[ds], CPX);
  addMC(cat, "Extra space used by in-place heapsort?", "O(1)", ["O(1)","O(n)","O(log n)","O(n\u00b2)"]);
  addMC(cat, "Extra space used by merge sort?", "O(n)", ["O(n)","O(1)","O(log n)","O(n\u00b2)"]);
  addMC(cat, "Recursion stack space of standard quicksort (average)?", "O(log n)", ["O(log n)","O(n)","O(1)","O(n\u00b2)"]);
})();

/* ============ SECTION 2 — DATA STRUCTURES (concepts) ============ */
(function dsConcepts(){
  const cat = "Data Structures";
  const usePool = ["a stack","a queue","a deque","a priority queue (heap)","a hash table","a binary search tree","a linked list","an array","a trie","a graph","a union-find (disjoint set) structure","a circular buffer"];
  add(cat, "Which data structure processes items LIFO?", "a stack", ["a queue","a deque","a hash table"]);
  add(cat, "Which data structure processes items FIFO?", "a queue", ["a stack","a priority queue (heap)","a binary search tree"]);
  add(cat, "Which structure allows cheap insert/remove at BOTH ends?", "a deque", ["a stack","a queue","a singly linked list"]);
  add(cat, "Which structure always pops the most-prioritized item first?", "a priority queue (heap)", ["a queue","a stack","a hash table"]);
  add(cat, "Which gives near O(1) lookup by an arbitrary key?", "a hash table", ["a linked list","a stack","a binary heap"]);
  add(cat, "Which structure is ideal for autocompleting word prefixes?", "a trie", ["a hash table","a queue","a stack"]);
  add(cat, "Which models one-to-many hierarchy like an org chart?", "a tree", ["a graph","a queue","a stack"]);
  add(cat, "Which models many-to-many relations like social networks?", "a graph", ["a tree","an array","a stack"]);
  add(cat, "Which detects connected components / cycle in undirected graphs?", "a union-find (disjoint set) structure", ["a stack","a queue","a hash table"]);
  add(cat, "Which implements round-robin turn-taking over a fixed slot count?", "a circular buffer", ["a stack","a trie","a binary heap"]);
  add(cat, "Which structure naturally arises from parentheses-matching (e.g., undo)?", "a stack", ["a queue","a heap","a graph"]);
  add(cat, "Which structure does BFS frontier management use?", "a queue", ["a stack","a heap","a trie"]);
  add(cat, "Which is the classic way to store function calls?", "a call stack", ["a queue","a heap","a graph"]);
  add(cat, "Sparse arrays store data efficiently using which pairing?", "index \u2192 value maps/entries", ["full contiguous copy","linked bits","sorted duplicates","stack frames"]);
  add(cat, "Why does a hash table degrade to O(n) lookups?", "when many collisions put keys in one bucket", ["when it is sorted","when keys are small","when values are strings","when load factor is 0"]);
  add(cat, "Load factor of a hash table is defined as", "filled slots / total slots", ["filled slots / total slots","collisions / inserts","size / 2","buckets / keys"]);
  add(cat, "Which BST stays height-balanced via rotations on insert/delete?", "an AVL tree", ["a skip list","a heap","a binary tree"]);
  add(cat, "A min-heap guarantees that", "every parent \u2264 its children", ["every parent \u2265 its children","keys are sorted","leaves hold all data","it has no duplicate levels"]);
  add(cat, "Binary-search trees lose O(log n) behavior when", "inserted in already-sorted order", ["randomly inserted","balanced","duplicated","hashed"]);
  addMC(cat, "In-order traversal of a BST yields elements in what order?", "ascending sorted order", ["random order","descending order","insertion order","level order"]);
  addMC(cat, "Which traversal needs a queue?", "Level-order", ["In-order","Pre-order","Post-order","Reverse in-order"]);
})();

/* ============ SECTION 3 — SORTING ALGORITHMS ============ */
(function sorting(){
  const cat = "Algorithms & Complexity";
  const S = ["Bubble sort","Selection sort","Insertion sort","Merge sort","Quick sort","Heap sort","Shell sort","Counting sort","Radix sort","Bucket sort","Tim sort"];
  add(cat, "Which sort repeatedly swaps adjacent out-of-order pairs?", "Bubble sort", ["Merge sort","Quick sort","Heap sort"]);
  add(cat, "Which sort selects the minimum remaining element each pass?", "Selection sort", ["Insertion sort","Radix sort","Bucket sort"]);
  add(cat, "Which sort builds the sorted prefix one inserted card at a time?", "Insertion sort", ["Shell sort","Merge sort","Counting sort"]);
  add(cat, "Which sort splits, recurses, then merges with guaranteed O(n log n)?", "Merge sort", ["Quick sort","Heap sort","Shell sort"]);
  add(cat, "Which sort picks a pivot and partitions around it?", "Quick sort", ["Merge sort","Radix sort","Selection sort"]);
  add(cat, "Which sort uses a max-heap and extracts the root repeatedly?", "Heap sort", ["Quick sort","Counting sort","Insertion sort"]);
  add(cat, "Which generalized insertion sort compares elements a decreasing gap apart?", "Shell sort", ["Tim sort","Radix sort","Merge sort"]);
  add(cat, "Which sort counts occurrences of each small integer key?", "Counting sort", ["Radix sort","Bucket sort","Heap sort"]);
  add(cat, "Which sort distributes integers into buckets digit-by-digit, usually via a stable sub-sort?", "Radix sort", ["Counting sort","Merge sort","Shell sort"]);
  add(cat, "Which sort scatters values into buckets then sorts each bucket?", "Bucket sort", ["Radix sort","Heap sort","Selection sort"]);
  add(cat, "Which hybrid of merge + insertion sort powers many standard libraries?", "Tim sort", ["Shell sort","Heap sort","Radix sort"]);
  add(cat, "Which algorithm sorts integers in linear time using bitwise digit passes with a STABLE subroutine?", "Radix sort", ["Quick sort","Merge sort","Heap sort"]);
  add(cat, "Among Merge, Quick, Heap and Selection sort, which one is STABLE?", "Merge sort", ["Quick sort","Heap sort","Selection sort"]);
  add(cat, "Among Merge, Bubble, Insertion and Quick sort, which one is NOT stable?", "Quick sort", ["Merge sort","Bubble sort","Insertion sort"]);
  add(cat, "Among Insertion, Heap, Selection and Shell sort, which one is STABLE?", "Insertion sort", ["Heap sort","Selection sort","Shell sort"]);
  add(cat, "Among Bubble, Selection, Quick and Heap sort, which one is STABLE?", "Bubble sort", ["Selection sort","Quick sort","Heap sort"]);
  add(cat, "Among Bubble, Insertion, Merge and Selection sort, which one is NOT stable?", "Selection sort", ["Bubble sort","Insertion sort","Merge sort"]);
  add(cat, "Among Merge, Tim, Counting and Heap sort, which one is NOT stable?", "Heap sort", ["Merge sort","Tim sort","Counting sort"]);
  add(cat, "Which algorithm is often fastest in practice on arrays but can hit O(n\u00b2)?", "Quick sort", ["Merge sort","Heap sort","Bubble sort"]);
  add(cat, "Which sort is in-place (needs only O(1) extra space, ignoring recursion)?", "Heap sort", ["Merge sort","Counting sort","Radix sort"]);
  add(cat, "Merge sort guarantees which worst-case time?", "O(n log n)", ["O(n\u00b2)","O(n)","O(log n)","O(n!)"]);
  add(cat, "Insertion sort achieves O(n) only when", "the array is already nearly sorted", ["random","reverse sorted","full of duplicates","prime-length"]);
  add(cat, "Quicksort's average complexity relies on", "roughly balanced partitions", ["stable comparisons","equal elements","sorted input","extra memory"]);
  add(cat, "Radix sort's runtime d(n + k) depends on", "digits d and base k", ["depth of recursion","swap count","partition size","cache misses"]);
})();

/* ============ SECTION 4 — GRAPHS, PARADIGMS, RECURSION ============ */
(function graphsParadigms(){
  const cat = "Algorithms & Complexity";
  const algos = ["Dijkstra","Bellman-Ford","Floyd-Warshall","Prim","Kruskal","DFS","BFS","Topological sort","Binary search","Kadane's algorithm"];
  add(cat, "Which finds single-source shortest paths for NON-NEGATIVE weights?", "Dijkstra", ["Bellman-Ford","Floyd-Warshall","Kruskal"]);
  add(cat, "Which shortest-path algorithm tolerates NEGATIVE edges and detects negative cycles?", "Bellman-Ford", ["Dijkstra","Prim","Floyd-Warshall"]);
  add(cat, "Which computes ALL-PAIRS shortest paths via triple loops?", "Floyd-Warshall", ["Dijkstra","Bellman-Ford","DFS"]);
  add(cat, "Which builds a minimum spanning tree by growing one tree from a vertex?", "Prim's algorithm", ["Kruskal's algorithm","Dijkstra","Bellman-Ford"]);
  add(cat, "Which MST algorithm sorts all edges then unions components?", "Kruskal's algorithm", ["Prim's algorithm","Floyd-Warshall","DFS"]);
  add(cat, "Which graph search uses a stack / recursion and goes deep first?", "DFS", ["BFS","Dijkstra","Prim"]);
  add(cat, "Which gives the fewest-edge path between two unweighted graph nodes?", "BFS", ["DFS","Bellman-Ford","Topological sort"]);
  add(cat, "A linear ordering of a DAG's vertices respecting edges is found by", "topological sort", ["Dijkstra","Kruskal","binary search"]);
  add(cat, "Maximum subarray sum in O(n) uses", "Kadane's algorithm", ["Dijkstra's algorithm","merge sort","binary search"]);
  add(cat, "Dynamic programming applies when problems have overlapping subproblems and", "optimal substructure", ["randomness","parallelism","monotonic stacks","constant keys"]);
  add(cat, "Greedy algorithms are CORRECT only when the problem has the greedy-choice property and", "optimal substructure", ["cycles","backtracking","memoization","negative weights"]);
  add(cat, "Divide and conquer's three steps are divide, conquer, and", "combine", ["greed","prune","hash","balance"]);
  add(cat, "Backtracking differs from brute force because it", "prunes partial candidates early", ["uses a hash","sorts input","always recurses","needs O(1) memory"]);
  add(cat, "A recurrence T(n) = 2T(n/2) + O(n) solves to", "O(n log n)", ["O(n)","O(log n)","O(n\u00b2)","O(2^n)"]);
  add(cat, "A recurrence T(n) = T(n/2) + O(1) solves to", "O(log n)", ["O(n)","O(1)","O(n\u00b2)","O(log\u00b2 n)"]);
  add(cat, "A recurrence T(n) = 2T(n/2) + O(1) solves to", "O(n)", ["O(log n)","O(n log n)","O(n\u00b2)","O(\u221an)"]);
  add(cat, "Recursion without reaching a base case results in", "infinite recursion (stack overflow)", ["memoization","tail call","backtracking","iteration"]);
  add(cat, "Memoization avoids re-computation by storing results in a", "cache/map", ["stack","queue","heap","bitmask"]);
  add(cat, "Tail-call recursion is special because compilers may convert it to", "a loop (O(1) stack)", ["recursion","hashing","sorting","backtracking"]);
  add(cat, "Binary search's precondition is that the input must be", "sorted", ["small","hashed","unique","balanced"]);
  add(cat, "The 'amortized' cost analysis averages over", "a worst-case sequence of operations", ["one operation","random inputs","memory only","cache hits"]);
  add(cat, "Which complexity class grows fastest asymptotically?", "O(n!)", ["O(n!)","O(2\u207f)","O(n\u00b2)","O(n log n)"]);
  add(cat, "If T(n)=O(n), doubling input makes runtime roughly", "double", ["quadruple","logarithmic","unchanged","exponential"]);
})();

/* ============ SECTION 5 — NETWORKING: PORTS & SERVICES ============ */
(function netPorts(){
  const cat = "Networking";
  const portPool = ["80","443","21","20","22","23","25","53","67","69","110","123","137","139","143","161","389","445","465","587","636","990","993","995","1433","1521","1883","3306","3389","5060","5432","5900","6379","8080","9092","11211","27017"];
  const svcPool = ["HTTP","HTTPS","FTP (control)","SSH","Telnet","SMTP","DNS","DHCP","TFTP","POP3","IMAP","NTP","SMB/CIFS","LDAP","RDP","VNC","MySQL","PostgreSQL","Redis","MongoDB","SNMP","MQTT","Kafka","Memcached","Microsoft SQL Server","Oracle DB","SIP"];
  const table = [
    ["HTTP","80"],["HTTPS","443"],["FTP control","21"],["SSH","22"],["Telnet","23"],["SMTP","25"],["DNS","53"],
    ["DHCP server","67"],["TFTP","69"],["POP3","110"],["NTP","123"],["IMAP","143"],["SNMP","161"],["LDAP","389"],
    ["SMB/CIFS","445"],["SMTP over TLS","465"],["SMTP submission","587"],["LDAPS","636"],["IMAPS","993"],["POP3S","995"],
    ["RDP","3389"],["MySQL","3306"],["VNC","5900"],["PostgreSQL","5432"],["Redis","6379"],["MongoDB","27017"],
    ["MQTT","1883"],["Kafka","9092"],["Memcached","11211"]
  ];
  for (const [svc, port] of table){
    add(cat, `Which well-known port does ${svc} use?`, port, ["80","443","22","53","25","3306","8080"].filter(p=>p!==port));
    add(cat, `The service most associated with port ${port} is`, svc, svcPool.filter(s=>s!==svc));
  }
  add(cat, "DNS zone transfers (TCP) commonly use which port?", "53", ["22","80","53","443"]);
  add(cat, "Which database does port 1433 typically indicate?", "Microsoft SQL Server", ["MySQL","PostgreSQL","MongoDB","Oracle"]);
  add(cat, "Which database does port 1521 typically indicate?", "Oracle DB", ["MySQL","PostgreSQL","SQL Server","Redis"]);
})();

/* ============ SECTION 6 — NETWORKING: PROTOCOLS & MODELS ============ */
(function netProto(){
  const cat = "Networking";
  const protos = ["TCP","UDP","IP","ICMP","ARP","DNS","DHCP","HTTP","HTTPS","FTP","SMTP","POP3","IMAP","SSH","TLS","NTP","SNMP","SIP","RTP"];
  add(cat, "Which protocol is connection-oriented and guarantees ordered, reliable delivery?", "TCP", ["UDP","ICMP","ARP"]);
  add(cat, "Which protocol is connectionless and offers no delivery guarantee?", "UDP", ["TCP","FTP","SMTP"]);
  add(cat, "Which protocol resolves domain names into IP addresses?", "DNS", ["ARP","DHCP","NTP"]);
  add(cat, "Which protocol assigns temporary (dynamic) IP addresses on a LAN?", "DHCP", ["DNS","ARP","SNMP"]);
  add(cat, "Which protocol maps an IPv4 address to a MAC address locally?", "ARP", ["DNS","ICMP","RARP"]);
  add(cat, "Which protocol carries error messages and is used by ping?", "ICMP", ["ARP","UDP","TCP"]);
  add(cat, "Which protocol sends email from client to mail server?", "SMTP", ["POP3","IMAP","HTTP"]);
  add(cat, "Which protocol downloads email typically deleting after fetch?", "POP3", ["IMAP","SMTP","SNMP"]);
  add(cat, "Which protocol syncs email across devices keeping messages on server?", "IMAP", ["POP3","SMTP","FTP"]);
  add(cat, "Which protocol encrypts web traffic end to end?", "TLS", ["SSH","HTTP","FTP"]);
  add(cat, "Which protocol gives secure remote shell access?", "SSH", ["Telnet","FTP","RDP"]);
  add(cat, "Which protocol transfers files, and is insecure by default?", "FTP", ["SFTP","HTTPS","SSH"]);
  add(cat, "Which protocol is used to transfer real-time voice (media) with low latency?", "RTP", ["TCP","HTTP","SMTP"]);
  add(cat, "Which protocol keeps clocks synchronized across a network?", "NTP", ["SNMP","ICMP","ARP"]);
  add(cat, "Which protocol monitors network devices (management information base)?", "SNMP", ["NTP","SMTP","ICMP"]);
  add(cat, "HTTP default port and transport respectively are", "80 over TCP", ["80 over UDP","443 over TCP","25 over TCP","53 over UDP"]);
  add(cat, "IP is best described as a", "connectionless, unreliable datagram protocol", ["reliable transport","link protocol","name service","routing daemon"]);
  add(cat, "Which layer of the OSI model does IP (routing) operate at?", "Network", ["Data link","Transport","Physical","Application"]);
  add(cat, "Which OSI layer do switches (MAC forwarding) operate at?", "Data link", ["Network","Physical","Transport","Application"]);
  add(cat, "Which OSI layer do hubs operate at?", "Physical", ["Data link","Network","Transport"]);
  add(cat, "Port numbers and sockets belong to which OSI layer?", "Transport", ["Network","Data link","Session","Application"]);
  add(cat, "Encryption/formatting/translation is the job of which OSI layer?", "Presentation", ["Session","Application","Transport"]);
  add(cat, "Dialog control (start/stop/resume sessions) is which OSI layer?", "Session", ["Presentation","Transport","Application"]);
  add(cat, "HTTP, FTP, SMTP live at which OSI layer?", "Application", ["Presentation","Transport","Network"]);
  add(cat, "The OSI layer whose PDU is the 'frame' is", "Data link", ["Network","Transport","Physical","Application"]);
  add(cat, "The OSI layer whose PDU is the 'segment' is", "Transport", ["Network","Data link","Session","Application"]);
  add(cat, "The OSI layer whose PDU is the 'packet' is", "Network", ["Transport","Data link","Physical","Presentation"]);
  add(cat, "The OSI layer that transmits raw bits over a medium is", "Physical", ["Data link","Network","Transport"]);

  // addressing / subnetting / switching
  add(cat, "An IPv4 address is how many bits long?", "32", ["16","48","64","128"]);
  add(cat, "An IPv6 address is how many bits long?", "128", ["32","48","64","96"]);
  add(cat, "A MAC (Ethernet) address is how many bits?", "48", ["32","48","64","128"]);
  add(cat, "The loopback IPv4 block is", "127.0.0.0/8", ["10.0.0.0/8","192.168.0.0/16","172.16.0.0/12"]);
  add(cat, "Which is an RFC 1918 private address?", "10.0.0.5", ["8.8.8.8","172.32.4.4","169.254.1.2","127.1.1.1"]);
  add(cat, "A /24 subnet has how many host addresses (usable)?", "254", ["256","254","128","62"]);
  add(cat, "A /30 subnet is commonly used for", "point-to-point links (2 usable hosts)", ["a single host","254 hosts"," multicast","a full class B"]);
  add(cat, "The default Class C subnet mask is", "255.255.255.0", ["255.0.0.0","255.255.0.0","255.255.255.255"]);
  add(cat, "CIDR /16 equals which dotted mask?", "255.255.0.0", ["255.0.0.0","255.255.255.0","255.255.255.128"]);
  add(cat, "A device that forwards packets between different networks is a", "router", ["switch","hub","bridge","repeater"]);
  add(cat, "A device that forwards frames within a LAN using MAC addresses is a", "switch", ["router","hub","gateway","repeater"]);
  add(cat, "Broadcast address for subnet 192.168.1.0/24 is", "192.168.1.255", ["192.168.1.0","192.168.1.1","192.168.1.128","255.255.255.255"]);
  add(cat, "The network address for 192.168.5.77/24 is", "192.168.5.0", ["192.168.5.77","192.168.5.255","192.168.0.0","192.168.5.32"]);
  addMC(cat, "TCP's mechanism to avoid overwhelming a slow receiver is called", "flow control", ["congestion collapse","routing","multiplexing","compaction"]);
  addMC(cat, "TCP's mechanism to avoid overwhelming the NETWORK is called", "congestion control", ["flow control","framing","encryption","polling"]);
  addMC(cat, "The TCP step that opens a connection is the", "three-way handshake", ["two-way ping","four-way close","single SYN","five-tuple"]);
  addMC(cat, "Which TCP flag ends a connection gracefully?", "FIN", ["SYN","ACK","RST","PSH"]);
  addMC(cat, "Which TCP flag abruptly aborts a connection?", "RST", ["FIN","SYN","URG","ACK"]);
  addMC(cat, "TCP assigns each byte a number for reliability called the", "sequence number", ["port number","checksum","window size","TTL"]);
  addMC(cat, "The field that limits how much data a receiver will accept is the", "window size", ["MSS","TTL","checksum","port"]);
  addMC(cat, "IP's field that prevents endless packet looping is the", "TTL (hop limit)", ["checksum","window","port","sequence"]);
  addMC(cat, "An internal router protocol among OSPF, BGP is which?", "OSPF", ["BGP","HTTP","SNMP","ARP"]);
  addMC(cat, "The inter-domain (between ISPs) routing protocol is", "BGP", ["OSPF","RIP","ICMP","ARP"]);
})();

/* ============ SECTION 7 — HTTP STATUS CODES ============ */
(function httpStatus(){
  const cat = "Networking";
  const meanings = ["OK","Created","Accepted","No Content","Moved Permanently","Found (temporary redirect)","Not Modified","Bad Request","Unauthorized","Forbidden","Not Found","Method Not Allowed","Request Timeout","Conflict","Gone","Unsupported Media Type","Too Many Requests","Internal Server Error","Not Implemented","Bad Gateway","Service Unavailable","Gateway Timeout","I'm a Teapot"];
  const codes = ["200","201","202","204","301","302","304","400","401","403","404","405","408","409","410","415","418","429","500","501","502","503","504"];
  const map = {
    "200":"OK","201":"Created","202":"Accepted","204":"No Content","301":"Moved Permanently","302":"Found (temporary redirect)",
    "304":"Not Modified","400":"Bad Request","401":"Unauthorized","403":"Forbidden","404":"Not Found","405":"Method Not Allowed",
    "408":"Request Timeout","409":"Conflict","410":"Gone","415":"Unsupported Media Type","418":"I'm a Teapot","429":"Too Many Requests",
    "500":"Internal Server Error","501":"Not Implemented","502":"Bad Gateway","503":"Service Unavailable","504":"Gateway Timeout"
  };
  for (const c in map){
    add(cat, `What does HTTP status code ${c} mean?`, map[c], meanings.filter(m=>m!==map[c]));
    add(cat, `Which HTTP status code means "${map[c]}"?`, c, codes.filter(x=>x!==c));
  }
  add(cat, "HTTP 3xx status codes indicate", "redirection", ["client errors","server errors","success","informational"]);
  add(cat, "HTTP 4xx status codes indicate", "client errors", ["redirection","server errors","success","informational"]);
  add(cat, "HTTP 5xx status codes indicate", "server errors", ["client errors","redirection","success","informational"]);
  add(cat, "Which status means the request had valid syntax but the server refused authorization?", "403 Forbidden", ["401 Unauthorized","400 Bad Request","404 Not Found"]);
  add(cat, "Which status means authentication is required?", "401 Unauthorized", ["403 Forbidden","404 Not Found","500 Internal Server Error"]);
  add(cat, "Which status is returned for rate limiting?", "429 Too Many Requests", ["400 Bad Request","403 Forbidden","503 Service Unavailable"]);
  add(cat, "A 204 response means", "success with no body returned", ["created","redirect","server error","no content-type"]);
})();

/* ============ SECTION 8 — HTML ============ */
(function html(){
  const cat = "HTML";
  const tagDesc = {
    "&lt;h1&gt;":"the largest heading","&lt;p&gt;":"a paragraph of text","&lt;a&gt;":"a hyperlink","&lt;div&gt;":"a generic block container",
    "&lt;span&gt;":"a generic inline container","&lt;ul&gt;":"an unordered (bulleted) list","&lt;ol&gt;":"an ordered (numbered) list",
    "&lt;li&gt;":"a list item","&lt;table&gt;":"tabular data","&lt;tr&gt;":"a table row","&lt;td&gt;":"a table data cell",
    "&lt;th&gt;":"a table header cell","&lt;form&gt;":"a user-input form","&lt;input&gt;":"an input control","&lt;button&gt;":"a clickable button",
    "&lt;img&gt;":"an image","&lt;svg&gt;":"inline scalable vector graphics","&lt;canvas&gt;":"a scriptable drawing surface",
    "&lt;nav&gt;":"navigation links","&lt;header&gt;":"introductory content","&lt;footer&gt;":"footer content","&lt;main&gt;":"the dominant content",
    "&lt;article&gt;":"a self-contained composition","&lt;section&gt;":"a thematic grouping","&lt;aside&gt;":"a tangentially related sidebar",
    "&lt;label&gt;":"a caption for a form control","&lt;select&gt;":"a dropdown of options","&lt;textarea&gt;":"a multi-line text input",
    "&lt;video&gt;":"a video player","&lt;audio&gt;":"an audio player","&lt;strong&gt;":"strong importance","&lt;em&gt;":"stress emphasis",
    "&lt;code&gt;":"inline code","&lt;pre&gt;":"preformatted text","&lt;blockquote&gt;":"a quoted section","&lt;figure&gt;":"illustration with caption",
    "&lt;details&gt;":"a disclosure widget","&lt;hr&gt;":"a thematic break","&lt;br&gt;":"a line break","&lt;iframe&gt;":"a nested browsing context"
  };
  const descVals = Object.values(tagDesc);
  const otherTags = Object.keys(tagDesc);
  for (const t in tagDesc){
    add(cat, `In HTML, what does the ${t} element represent?`, tagDesc[t], descVals.filter(d=>d!==tagDesc[t]));
    add(cat, `Which HTML element is used for ${tagDesc[t]}?`, t, otherTags.filter(x=>x!==t));
  }
  const attrs = {
    "href":["the URL for a link or anchor","a"],"src":["the resource URL for media","img"],
    "alt":["alternative text for images","img"],"for":["associating a label with a control","label"],
    "action":["where a form submits","form"],"method":["the HTTP method of a form","form"],
    "type":["the kind of input or link","input"],"rel":["relationship of a link","link"],
    "colspan":["cells a table cell spans","td"],"rowspan":["rows a table cell spans","td"],
    "placeholder":["hint text inside an empty field","input"],"value":["the initial/current value of a field","input"],
    "target":["where to open a link","a"],"disabled":["whether a control is unusable","button"]
  };
  for (const a in attrs){
    add(cat, `The HTML \`${a}\` attribute is used to specify`, attrs[a][0], ["the element's color","an inline script","the tab order only","the HTTP status"]);
  }
  add(cat, "Which input type hides typed characters?", "password", ["text","hidden","email","number"]);
  add(cat, "Which input type submits a value without showing it?", "hidden", ["password","text","file","checkbox"]);
  add(cat, "Which input type validates an email address?", "email", ["text","mail","url","tel"]);
  add(cat, "Which input type lets you pick one option from many (radio buttons share a name)?", "radio", ["checkbox","select","range","text"]);
  add(cat, "Which input type allows multiple independent on/off selections?", "checkbox", ["radio","range","number","date"]);
  add(cat, "Which input type shows a slider?", "range", ["number","slider","meter","bar"]);
  add(cat, "Which input type opens a date picker?", "date", ["text","datetime","calendar","time"]);
  add(cat, "Which attribute makes a form field read-only but still submitted?", "readonly", ["disabled","hidden","locked","static"]);
  add(cat, "Which HTML5 attribute makes a field required before submit?", "required", ["mandatory","validate","notnull","must"]);
  add(cat, "The correct HTML5 doctype declaration is", "&lt;!DOCTYPE html&gt;", ["&lt;!DOCTYPE HTML5&gt;","&lt;doctype html&gt;","&lt;!html5 doctype&gt;"]);
  add(cat, "Which is a valid void (self-closing) element?", "&lt;br&gt;", ["&lt;div&gt;","&lt;p&gt;","&lt;span&gt;","&lt;section&gt;"]);
  add(cat, "Which character entity shows a less-than sign?", "&amp;lt;", ["&amp;gt;","&amp;amp;","&amp;quot;","&lt;"]);
  add(cat, "Which character entity shows an ampersand?", "&amp;amp;", ["&amp;lt;","&amp;gt;","&amp;nbsp;","&amp;copy;"]);
  add(cat, "Which element wraps the page's visible content?", "&lt;body&gt;", ["&lt;head&gt;","&lt;html&gt;","&lt;title&gt;","&lt;meta&gt;"]);
  add(cat, "Which element contains page metadata like the title?", "&lt;head&gt;", ["&lt;body&gt;","&lt;main&gt;","&lt;footer&gt;","&lt;section&gt;"]);
  add(cat, "How do you make an internal page anchor jump to #top?", "give an element id=\"top\"", ["set href=\"#top\" on the target","use class top","wrap in <nav>","add data-top"]);
  add(cat, "Which tag pair correctly nests a list?", "&lt;ul&gt; around &lt;li&gt; items", ["&lt;li&gt; around &lt;ul&gt;","&lt;ol&gt; around &lt;tr&gt;","&lt;table&gt; around &lt;li&gt;","&lt;div&gt; around &lt;table&gt; items"]);
  add(cat, "Which element gives an accessible caption to a &lt;figure&gt;?", "&lt;figcaption&gt;", ["&lt;caption&gt;","&lt;label&gt;","&lt;title&gt;","&lt;legend&gt;"]);
  add(cat, "Which element should contain a page's primary navigation?", "&lt;nav&gt;", ["&lt;menu&gt;","&lt;div class='links'&gt;","&lt;aside&gt;","&lt;section&gt;"]);
  add(cat, "Which attribute adds client-side interactivity hooks like onclick?", "event handler attributes", ["rel","media","charset","role"]);
  add(cat, "The &lt;table&gt; header row cells use which tag?", "&lt;th&gt;", ["&lt;td&gt;","&lt;hd&gt;","&lt;hh&gt;","&lt;caption&gt;"]);
})();

/* ============ SECTION 9 — CSS ============ */
(function css(){
  const cat = "CSS";
  const propFacts = {
    "color":"sets text color","background":"sets an element's background","font-size":"sets text size",
    "font-family":"sets the typeface stack","margin":"creates space outside the border","padding":"creates space inside the border",
    "border":"draws a box edge","width":"sets the horizontal size","height":"sets the vertical height","opacity":"fades an element via transparency",
    "transform":"applies 2D/3D visual transforms","transition":"animates property changes over time","box-shadow":"adds a drop shadow",
    "border-radius":"rounds corners","text-align":"aligns text horizontally","display":"chooses the layout box type",
    "position":"chooses the placement scheme","z-index":"sets the stacking order","flex-direction":"sets the flex main axis","grid-template-columns":"defines grid column tracks",
    "line-height":"sets vertical space between lines","letter-spacing":"sets the space between characters","cursor":"changes the mouse pointer style",
    "overflow":"controls behavior when content exceeds the box","align-items":"aligns items on the flex cross axis","justify-content":"distributes items on the flex main axis"
  };
  const propNames = Object.keys(propFacts);
  for (const p in propFacts){
    add(cat, `Which CSS property ${propFacts[p]}?`, p, propNames.filter(x=>x!==p));
  }
  add(cat, "In the CSS box model, the innermost region is the", "content area", ["padding","border","margin"]);
  add(cat, "In the CSS box model, the layer directly outside the content is the", "padding", ["border","margin","outline"]);
  add(cat, "Which units are relative to the ROOT font size?", "rem", ["em","px","%","pt"]);
  add(cat, "Which units are relative to the PARENT font size?", "em", ["rem","px","%","cm"]);
  add(cat, "Which viewport unit is 1% of the viewport width?", "vw", ["vh","vmin","vmax","px"]);
  add(cat, "Which viewport unit is 1% of the smaller viewport dimension?", "vmin", ["vw","vh","vmax","%"]);
  add(cat, "The selector `.card` matches elements by their", "class", ["id","tag","attribute","name"]);
  add(cat, "The selector `#hero` matches elements by their", "id", ["class","tag","state","title"]);
  add(cat, "The selector `p.note` matches", "paragraphs with class note", ["all notes","any .note","a child of p","all paragraphs"]);
  add(cat, "The selector `ul > li` matches", "li that are direct children of ul", ["all li anywhere","li siblings of ul","first li","any li"]);
  add(cat, "The selector `ul li` (space) matches", "li inside ul at any depth", ["only direct children","li before ul","adjacent li","sibling li"]);
  add(cat, "The selector `a:hover` styles a link when it is", "pointed at by the mouse", ["clicked once ever","focused","visited","disabled"]);
  add(cat, "The selector `input:focus` styles a field when it is", "the active keyboard target", ["hovered","checked","disabled","filled"]);
  add(cat, "The selector `button:active` styles a button while it is", "being pressed", ["disabled","hovered","focused","default"]);
  add(cat, "The pseudo-class `:disabled` matches", "controls that cannot be used", ["hidden controls","checked controls","required controls","first controls"]);
  add(cat, "The pseudo-class `:nth-child(2)` matches", "the second child element", ["the second of type","the last child","two children","any even child"]);
  add(cat, "The `::before` pseudo-element", "inserts generated content before the element", ["styles the first child","targets hover","adds a border","removes the node"]);
  add(cat, "Which has the HIGHEST specificity?", "#id .class", ["#id .class",".class .class","element","*"]);
  add(cat, "Which declaration wins when two rules have equal specificity?", "the one that appears later", ["the first one","the shorter one","neither (conflict)","the one with fewer selectors"]);
  add(cat, "Which value !important affects?", "declaration priority in the cascade", ["cache behavior","DOM order","selector parsing","inheritance depth"]);
  add(cat, "display: flex creates", "a one-dimensional flex layout", ["a grid","an inline run","a table","a float"]);
  add(cat, "display: grid creates", "a two-dimensional layout", ["a flex row","an inline block","a stack","a table cell"]);
  add(cat, "flex-direction: row-reverse makes the main axis run", "right to left", ["top to bottom","left to right always","diagonal","unchanged"]);
  add(cat, "Which flex value pushes items to both ends?", "justify-content: space-between", ["align-items: center","flex-wrap: wrap","flex-grow: 1","justify-content: center"]);
  add(cat, "align-items: center on a flex row", "vertically centers items", ["centers on main axis","wraps items","grows items","justifies content"]);
  add(cat, "position: absolute positions an element relative to", "its nearest positioned ancestor", ["the viewport only","its parent always","static flow","the body"]);
  add(cat, "position: fixed positions an element relative to", "the viewport", ["the parent","nearest positioned ancestor","static flow","the document end"]);
  add(cat, "position: sticky keeps an element", "relative until it hits an offset, then fixed", ["always fixed","always static","absolute to body","floating"]);
  add(cat, "@media (min-width: 600px) applies styles when", "the viewport is 600px or wider", ["under 600px","printing only","600px tall","dark mode"]);
  add(cat, "Which shorthand sets margin top/right/bottom/left in order?", "margin: 1px 2px 3px 4px", ["margin: 1 2 3 4 clockwise from bottom","padding: ...","margin: all","outline: ..."]);
  add(cat, "color: rgb(255,0,0) is", "red", ["green","blue","white","black"]);
  add(cat, "Which color is fully transparent?", "rgba(0,0,0,0)", ["#000000","white","rgba(0,0,0,1)","transparent-color"]);
  add(cat, "Which property hides an element but keeps its layout space?", "visibility: hidden", ["display: none","position: absolute","opacity: 0.5","overflow: hidden"]);
  add(cat, "Which property removes an element and its layout space?", "display: none", ["visibility: hidden","opacity: 0","z-index: -1","pointer-events: none"]);
  add(cat, "A CSS custom property is declared as", "--brand: #06f;", ["$brand: #06f;","@brand: #06f;","var brand: #06f;","::brand #06f"]);
  add(cat, "Which is a valid CSS comment?", "/* note */", ["// note","# note","<!-- note -->","' note"]);
  add(cat, "box-sizing: border-box makes width include", "padding and border", ["margin only","border only","content only","outline"]);
  add(cat, "The default box-sizing is", "content-box", ["border-box","padding-box","margin-box","fixed"]);
})();

/* ============ SECTION 10 — JAVASCRIPT ============ */
(function js(){
  const cat = "JavaScript";
  add(cat, "Which keyword declares a block-scoped variable you can reassign?", "let", ["var","const","function"]);
  add(cat, "Which keyword declares a block-scoped binding you cannot reassign?", "const", ["let","var","static"]);
  add(cat, "Which keyword declares a function-scoped variable?", "var", ["let","const","class"]);
  add(cat, "What does typeof null evaluate to?", "\"object\"", ["\"null\"","\"undefined\"","\"number\""]);
  add(cat, "What does typeof undefined evaluate to?", "\"undefined\"", ["\"null\"","\"object\"","\"boolean\""]);
  add(cat, "What does typeof function(){} evaluate to?", "\"function\"", ["\"object\"","\"callable\"","\"undefined\""]);
  add(cat, "What does Array.isArray([]) return?", "true", ["\"array\"","false","undefined","\"object\""]);
  add(cat, "What does [] == false evaluate to?", "true", ["false","NaN","undefined","\"\""]);
  add(cat, "What does [] === [] evaluate to?", "false", ["true","{}","undefined","\"\""]);
  add(cat, "What does null == undefined evaluate to?", "true", ["false","throws","{}","0"]);
  add(cat, "What does null === undefined evaluate to?", "false", ["true","throws","0","{}"]);
  add(cat, "What is typeof NaN?", "\"number\"", ["\"NaN\"","\"undefined\"","\"object\"","\"boolean\""]);
  add(cat, "How many falsy values does JavaScript have (e.g. 0, \"\", null, undefined, NaN, false)?", "Six", ["Six","Four","Three","Ten"]);
  add(cat, "What does 2 ** 3 evaluate to?", "8", ["6","9","5","\"23\""]);
  add(cat, "What does 10 % 3 evaluate to?", "1", ["3","0","1.5","2"]);
  add(cat, "What does Math.floor(-2.3) return?", "-3", ["-2","-2.3","2","-1"]);
  add(cat, "What does Math.round(2.5) return?", "3", ["2","2.5","0","4"]);
  add(cat, "What does parseInt(\"42px\") return?", "42", ["NaN","\"42\"","\"42px\"","0"]);
  add(cat, "What does Number(\"abc\") return?", "NaN", ["0","\"abc\"","Infinity","undefined"]);
  add(cat, "What does \"5\" + 3 evaluate to?", "\"53\"", ["8","\"8\"","NaN","\"5 3\""]);
  add(cat, "What does \"5\" - 3 evaluate to?", "2", ["\"53\"","\"2\"","NaN","8"]);
  add(cat, "Which array method adds to the end?", "push", ["pop","shift","unshift"]);
  add(cat, "Which array method removes the last element?", "pop", ["push","shift","unshift"]);
  add(cat, "Which array method adds to the start?", "unshift", ["push","pop","shift"]);
  add(cat, "Which array method removes the first element?", "shift", ["pop","unshift","push"]);
  add(cat, "Which returns a new array with each item transformed?", "map", ["forEach","filter","reduce"]);
  add(cat, "Which returns a new array of items passing a predicate?", "filter", ["map","find","reduce"]);
  add(cat, "Which returns the FIRST item passing a predicate?", "find", ["filter","map","findIndex"]);
  add(cat, "Which returns the boolean if ANY item passes?", "some", ["every","find","filter"]);
  add(cat, "Which returns the boolean if ALL items pass?", "every", ["some","find","reduce"]);
  add(cat, "Which collapses an array to one accumulated value?", "reduce", ["map","filter","find"]);
  add(cat, "Which method returns a sorted COPY without mutating (with a comparator)?", "[...arr].sort()", ["arr.sort()","arr.order()","arr.sorted()","arr.merge()"]);
  add(cat, "Which string method splits a string into an array?", "split", ["join","slice","substring"]);
  add(cat, "Which string method extracts a slice by indices?", "slice", ["splice","split","charAt"]);
  add(cat, "Which value does an arrow function NOT bind lexically?", "arguments object", ["this","super","arguments","new.target"]);
  add(cat, "A closure keeps access to", "variables from its defining scope", ["only globals","only parameters","the DOM","private fields"]);
  add(cat, "What does `this` refer to in an ARROW function?", "the enclosing lexical scope", ["the caller object","the global object always","undefined","the new instance"]);
  add(cat, "Which operator provides a default when the left side is null/undefined?", "??", ["||","&","!","??=",1]);
  add(cat, "Which safely accesses a?.b?.c?", "optional chaining (?.)", ["null coalescing (??)","spread (...)","ternary","typeof"]);
  add(cat, "An async function always returns", "a Promise", ["undefined","a generator","a callback","null"]);
  add(cat, "What does `await` do inside an async function?", "pauses until the Promise settles", ["cancels it","returns a callback","makes it sync at compile","spawns a thread"]);
  add(cat, "Which Promise handler runs on rejection?", ".catch", [".then",".finally",".resolve"]);
  add(cat, "Which Promise handler runs regardless of outcome?", ".finally", [".then",".catch",".all"]);
  add(cat, "Promise.all rejects when", "any input promise rejects", ["all reject","none resolve","the first resolves","it times out"]);
  add(cat, "Promise.all resolves with", "an array of results in input order", ["a single value","the first result","an object","undefined"]);
  add(cat, "setTimeout runs its callback", "once after a delay", ["repeatedly","immediately","synchronously","never"]);
  add(cat, "setInterval runs its callback", "repeatedly on an interval", ["once","immediately","after load","never"]);
  add(cat, "Which DOM API returns the first match of a CSS selector?", "querySelector", ["querySelectorAll","getElementById","getElementsByClassName"]);
  add(cat, "Which DOM method reads/updates plain text of a node?", "textContent", ["innerHTML","value","getAttribute"]);
  add(cat, "Which method creates a new element node?", "document.createElement", ["appendChild","createTextNode","insertAdjacent"]);
  add(cat, "JSON.parse turns a string into", "a JavaScript value", ["a blob","a number always","a function","undefined"]);
  add(cat, "JSON.stringify turns a value into", "a JSON string", ["a buffer","an object","NaN","a symbol"]);
  add(cat, "Which is valid JSON?", "{\"a\": [1, 2]}", ["{'a': 1}","{a: 1}","[1, 2,]","(1)"]);
  add(cat, "Which loop iterates an array's VALUES?", "for...of", ["for...in","for(key)","while"]);
  add(cat, "Which loop iterates an object's enumerable KEYS?", "for...in", ["for...of","forEach","reduce"]);
  add(cat, "Which adds a private-ish field in a modern class?", "#name", ["$name","@name","private name","_name"]);
  add(cat, "var hoisting initializes the binding to", "undefined", ["its value","null","0","throws"]);
  add(cat, "let/const in the same scope before declaration causes", "a ReferenceError (TDZ)", ["undefined","hoisting","null","silent"]);
  add(cat, "Which is NOT hoisted and usable before definition?", "class declaration", ["function declaration","var","function expression","let"]);
})();

/* ============ SECTION 11 — OPERATING SYSTEMS ============ */
(function os(){
  const cat = "Operating Systems";
  const sched = ["First-Come First-Served","Shortest Job First","Round Robin","Priority scheduling","Multilevel Feedback Queue","Shortest Remaining Time First"];
  add(cat, "Which CPU scheduling is non-preemptive and serves by arrival order?", "First-Come First-Served", ["Round Robin","Shortest Remaining Time First","Priority preemptive"]);
  add(cat, "Which scheduling gives every process an equal time slice?", "Round Robin", ["FCFS","SJF","Batch"]);
  add(cat, "Which preemptive variant of SJF picks the shortest remaining job?", "Shortest Remaining Time First", ["FCFS","Round Robin","Multilevel Queue"]);
  add(cat, "Which scheduling can cause starvation without aging?", "Priority scheduling", ["Round Robin","FCFS fair-share","Time slicing"]);
  add(cat, "Aging is added to which scheduling to prevent starvation?", "Priority scheduling", ["FCFS","Round Robin","SJF"]);
  add(cat, "Which is the key metric Round Robin's quantum trades off?", "context-switch overhead vs responsiveness", ["memory size","disk seeks","cache lines","network hops"]);
  add(cat, "Deadlock's four Coffman conditions are mutual exclusion, hold-and-wait, no-preemption and", "circular wait", ["races","priority inversion","thrashing","convoy effect"]);
  add(cat, "Which algorithm avoids deadlock by checking a safe state before allocation?", "Banker's algorithm", ["LRU","Round Robin","Bellman-Ford"]);
  add(cat, "Allowing preemption breaks which deadlock condition?", "no-preemption", ["mutual exclusion","hold-and-wait","circular wait","all four"]);
  add(cat, "Ordering resource requests globally breaks which condition?", "circular wait", ["mutual exclusion","no-preemption","hold-and-wait","none"]);
  add(cat, "Dividing memory into equal fixed pages versus variable segments reduces", "external fragmentation", ["internal fragmentation","cache misses","TLB size","page faults"]);
  add(cat, "Paging's leftover unused space inside a page is which fragmentation?", "internal fragmentation", ["external","stack","swap","segment"]);
  add(cat, "Which maps virtual pages to physical frames?", "the page table", ["inode","descriptor","cache line","TLB only"]);
  add(cat, "Which small hardware cache speeds up page-table lookups?", "TLB", ["MMU","CPU L1","disk cache","buffer cache"]);
  add(cat, "Loading a page only when referenced is called", "demand paging", ["swapping","thrashing","prefetching","segmentation"]);
  add(cat, "A process thrashes when", "paging dominates actual work", ["it forks","it sleeps","context-switches rarely","it terminates"]);
  add(cat, "Which page-replacement is theoretically optimal but needs future knowledge?", "OPT (Belady's)", ["FIFO","LRU","Clock","LFU"]);
  add(cat, "Which page-replacement evicts the least recently used page?", "LRU", ["FIFO","OPT","MFU","Random"]);
  add(cat, "Belady's anomaly is observed with which policy?", "FIFO", ["LRU","OPT","Clock","LFU"]);
  add(cat, "The smallest unit of CPU dispatch that shares an address space is a", "thread", ["process","job","kernel","queue"]);
  add(cat, "Two threads of one process definitely share", "the address space", ["the stack","registers","program counter","thread ID"]);
  add(cat, "Changing from one process to another requires saving/restoring the", "PCB (context switch)", ["inode","page table only","cache","interrupt vector"]);
  add(cat, "Which call creates a child that is an exact copy?", "fork", ["exec","wait","brk"]);
  add(cat, "Which call replaces the current image with a new program?", "exec", ["fork","exit","yield"]);
  add(cat, "A child that finished but whose parent hasn't waited becomes a", "zombie", ["orphan","daemon","thread","kernel"]);
  add(cat, "A child whose parent died gets reparented to init as an", "orphan", ["zombie","daemon","process group","thread"]);
  add(cat, "Which IPC is a fixed-size in-kernel buffer for related processes?", "pipe", ["socket","signal","thread","pipe-and-filter only"]);
  add(cat, "Which synchronization primitive is a counter allowing N entries?", "semaphore", ["mutex","register","cache","flag"]);
  add(cat, "A binary semaphore allowing one holder is basically a", "mutex", ["pipe","monitor","barrier","spin only"]);
  add(cat, "A region where shared data is accessed is the", "critical section", ["kernel","quantum","heap","interrupt"]);
  add(cat, "Peterson's algorithm solves which problem in software?", "mutual exclusion", ["deadlock avoidance","page replacement","scheduling","parsing"]);
  add(cat, "Which stores a file's permissions, sizes and block pointers?", "inode", ["superblock","journal","MFT","B+ tree"]);
  add(cat, "Which Linux file-system family is journaled and common (e.g. ext4)?", "ext4", ["FAT16","HPFS","Minix","ISO 9660"]);
  add(cat, "Permission bits rwx for owner/group/other: 7 equals", "rwx", ["rw-","r-x","--x","r--"]);
  add(cat, "Permission value 5 means", "r-x", ["rw-","rwx","--x","r--"]);
  addMC(cat, "Which interrupt type is triggered by hardware devices?", "hardware interrupt", ["software interrupt","system call","syscall trap","page fault only"]);
  addMC(cat, "A system call is invoked via a", "software interrupt/trap", ["hardware IRQ","DMA","timer tick","network packet"]);
  add(cat, "Which is the core of the OS residing in memory permanently?", "kernel", ["shell","compiler","daemon set","BIOS"]);
  add(cat, "The user command interpreter above the kernel is the", "shell", ["kernel","loader","microkernel","hypervisor"]);
  add(cat, "A microkernel primarily moves which services out of kernel space?", "drivers/file systems", ["the CPU scheduler entirely","the clock","the interrupt controller","the MMU"]);
  add(cat, "Which boot firmware is the modern replacement for BIOS?", "UEFI", ["GRUB only","POST","MBR","LILO"]);
  add(cat, "Which scheduler handles disk I/O by servicing the nearest request?", "SSTF", ["FCFS","SCAN","C-SCAN","LOOK"]);
  addMC(cat, "RAID 0 provides", "striping without redundancy", ["mirroring","parity","hot spare","no striping"]);
  addMC(cat, "RAID 1 provides", "mirroring", ["striping","single parity","distributed parity","no redundancy"]);
  addMC(cat, "RAID 5 provides", "block-level striping with distributed parity", ["pure mirroring","no parity","two parity disks","striping only"]);

  // Linux commands (unique embedded stems)
  const cmds = {
    "ls":"list directory contents","cd":"change the working directory","pwd":"print the working directory",
    "grep":"search text using patterns","find":"locate files in a hierarchy","chmod":"change file mode bits",
    "chown":"change file owner and group","ps":"report running processes","top":"live process and CPU monitor",
    "kill":"send a signal to a PID","df":"report file-system disk usage","du":"estimate file space used",
    "tar":"archive/extract a bundle","cat":"print/concatenate file contents","mv":"move or rename","cp":"copy files",
    "rm":"remove files","mkdir":"make a directory","man":"show the manual page","tail":"show the end of a file",
    "head":"show the start of a file","wc":"count lines/words/bytes","touch":"update times or make an empty file",
    "ln":"create links","whoami":"print the effective user","netstat":"show network connections","lsof":"list open files",
    "crontab":"schedule recurring jobs","uname":"show kernel/system info","free":"show memory usage","scp":"copy over SSH","ssh":"open a secure shell session"
  };
  const cmdNames = Object.keys(cmds);
  for (const c in cmds) add(cat, `In Linux, what does the \`${c}\` command do?`, cmds[c], cmdNames.filter(x=>x!==c).map(x=>`${x}: ${cmds[x]}`));
  add(cat, "Which signal does \`kill -9\` send?", "SIGKILL", ["SIGTERM","SIGHUP","SIGINT"]);
  add(cat, "Which signal does pressing Ctrl+C send?", "SIGINT", ["SIGKILL","SIGSTOP","SIGQUIT"]);
  add(cat, "Which command changes a file's permissions?", "chmod", ["chown","chgrp","chattr"]);
  add(cat, "Which command lists processes with live CPU usage?", "top", ["ps aux","df","lsof"]);
})();

/* ============ SECTION 12 — DATABASES & SQL ============ */
(function db(){
  const cat = "Databases & SQL";
  add(cat, "Which JOIN keeps only rows matching in BOTH tables?", "INNER JOIN", ["LEFT JOIN","RIGHT JOIN","FULL OUTER JOIN"]);
  add(cat, "Which JOIN keeps all left rows plus matching right rows?", "LEFT JOIN", ["INNER JOIN","RIGHT JOIN","CROSS JOIN"]);
  add(cat, "Which JOIN keeps all rows from BOTH tables?", "FULL OUTER JOIN", ["INNER JOIN","LEFT JOIN","SELF JOIN"]);
  add(cat, "Which JOIN yields the Cartesian product?", "CROSS JOIN", ["INNER JOIN","NATURAL JOIN","SELF JOIN"]);
  add(cat, "Joining a table to itself is a", "SELF JOIN", ["CROSS JOIN","OUTER JOIN","NATURAL JOIN"]);
  add(cat, "Which clause filters rows BEFORE grouping?", "WHERE", ["GROUP BY","HAVING","ORDER BY"]);
  add(cat, "Which clause filters AFTER aggregation?", "HAVING", ["WHERE","GROUP BY","DISTINCT"]);
  add(cat, "Which clause sorts the result set?", "ORDER BY", ["GROUP BY","WHERE","HAVING"]);
  add(cat, "Which clause groups rows for aggregates?", "GROUP BY", ["ORDER BY","HAVING","UNION"]);
  add(cat, "Which keyword removes duplicate result rows?", "DISTINCT", ["UNIQUE","ONLY","SINGLE"]);
  add(cat, "Which aggregate counts rows?", "COUNT()", ["SUM()","AVG()","MAX()"]);
  add(cat, "Which aggregate returns the mean?", "AVG()", ["COUNT()","SUM()","MEDIAN()"]);
  add(cat, "Which aggregate adds values?", "SUM()", ["AVG()","COUNT()","TOTAL()"]);
  add(cat, "Which statement adds new rows?", "INSERT", ["UPDATE","DELETE","MERGE"]);
  add(cat, "Which statement changes existing rows?", "UPDATE", ["INSERT","ALTER","UPSERT"]);
  add(cat, "Which statement removes rows (logged, with WHERE)?", "DELETE", ["DROP","TRUNCATE","REMOVE"]);
  add(cat, "Which removes all rows quickly without row-by-row logging?", "TRUNCATE", ["DELETE","DROP TABLE","DROP DATABASE"]);
  add(cat, "Which drops an entire table object (structure + data)?", "DROP TABLE", ["DELETE","TRUNCATE","ALTER"]);
  add(cat, "Which changes a table's structure?", "ALTER TABLE", ["UPDATE","MODIFY","CHANGE TABLE"]);
  add(cat, "Which language class is SELECT?", "DQL", ["DDL","DML","DCL"]);
  add(cat, "Which language class is CREATE/DROP/ALTER?", "DDL", ["DML","DCL","TCL"]);
  add(cat, "Which language class is INSERT/UPDATE/DELETE?", "DML", ["DDL","DCL","DQL"]);
  add(cat, "Which language class is GRANT/REVOKE?", "DCL", ["DDL","DML","TCL"]);
  add(cat, "Which language class is COMMIT/ROLLBACK/SAVEPOINT?", "TCL", ["DCL","DDL","DQL"]);
  add(cat, "Which key uniquely identifies a row and cannot be NULL?", "Primary key", ["Foreign key","Candidate key","Alternate key"]);
  add(cat, "Which key enforces a relationship to another table?", "Foreign key", ["Primary key","Super key","Surrogate key"]);
  add(cat, "A minimal superkey is called a", "candidate key", ["primary key","foreign key","composite key"]);
  add(cat, "A key made of multiple columns is a", "composite key", ["surrogate key","candidate key","unique index"]);
  add(cat, "Which constraint disallows NULL values?", "NOT NULL", ["UNIQUE","CHECK","DEFAULT"]);
  add(cat, "Which constraint evaluates a boolean predicate on writes?", "CHECK", ["UNIQUE","DEFAULT","PRIMARY KEY"]);
  add(cat, "Which constraint supplies a value when none is given?", "DEFAULT", ["CHECK","UNIQUE","NOT NULL"]);
  add(cat, "First Normal Form requires", "atomic (indivisible) columns, no repeating groups", ["no transitive dependencies","every determinant a key","no partial dependencies"]);
  add(cat, "Second Normal Form removes", "partial dependencies on a composite key", ["transitive dependencies","repeating groups","multivalued dependencies"]);
  add(cat, "Third Normal Form removes", "transitive dependencies", ["partial dependencies","atomic violations","join dependencies"]);
  add(cat, "BCNF requires every functional-dependency determinant to be a", "candidate key", ["foreign key","super role","trigger"]);
  add(cat, "A clustered index stores", "the rows in key order", ["only pointers","randomly","no data","in a hash"]);
  add(cat, "Which index type speeds lookups but costs write time and space?", "B-tree index", ["view","stored procedure","trigger"]);
  add(cat, "ACID's A stands for", "Atomicity", ["Availability","Agreement","Association"]);
  add(cat, "ACID's D stands for", "Durability", ["Deduplication","Distribution","Duality"]);
  add(cat, "Isolation levels protect against dirty reads, non-repeatable reads and", "phantom reads", ["deadlocks only","syntax errors","type errors","fragmentation"]);
  add(cat, "The strictest SQL isolation level is", "Serializable", ["Read Uncommitted","Read Committed","Repeatable Read"]);
  add(cat, "CAP trades Consistency vs Availability during a", "network partition", ["commit","backup","vacuum","reindex"]);
  add(cat, "MongoDB stores data as", "documents (BSON)", ["fixed tables","key-value only","columns","graphs only"]);
  add(cat, "Redis is primarily a", "key-value store", ["document DB","graph DB","column store","RDBMS"]);
  add(cat, "Neo4j is a", "graph database", ["document DB","key-value store","time-series DB","column DB"]);
  add(cat, "A saved query callable like a virtual table is a", "VIEW", ["index","trigger","schema","cursor"]);
  add(cat, "Code that runs automatically on row change is a", "trigger", ["stored procedure","view","index"]);
  add(cat, "A reusable server-side SQL program is a", "stored procedure", ["view","trigger","subquery"]);
  add(cat, "In LIKE, the % wildcard matches", "any sequence of characters", ["one character","only digits","a null","an index"]);
  add(cat, "In LIKE, the _ wildcard matches", "exactly one character", ["any sequence","a digit","a row","a key"]);
  add(cat, "Which combines two SELECTs removing duplicate rows?", "UNION", ["UNION ALL","JOIN","INTERSECT ALL"]);
  add(cat, "Which returns only rows common to both SELECTs?", "INTERSECT", ["UNION","MINUS","JOIN"]);
  add(cat, "Which returns rows in the first SELECT not in the second (some dialects)?", "EXCEPT", ["UNION","INTERSECT","NATURAL JOIN"]);
})();

/* ============ SECTION 13 — GIT & VERSION CONTROL ============ */
(function git(){
  const cat = "Git & Version Control";
  const cmds = {
    "git init":"start a new repository","git clone":"copy a remote repo locally","git add":"stage changes for the next commit",
    "git commit":"snapshot staged changes","git status":"show working and staging state","git log":"show commit history",
    "git diff":"show unstaged changes","git push":"upload commits to a remote","git pull":"fetch then merge remote changes",
    "git fetch":"download remote refs without merging","git merge":"integrate another branch","git rebase":"replay commits onto a new base",
    "git cherry-pick":"apply one specific commit elsewhere","git branch":"list or create branches","git checkout":"switch branch or restore files",
    "git switch":"change branch","git reset":"move HEAD to undo commits","git revert":"make a new commit undoing an old one",
    "git stash":"shelve uncommitted changes temporarily","git tag":"label a commit as a version","git remote":"manage remote URLs",
    "git rm":"stage a file deletion","git bisect":"binary-search history for a bug","git blame":"show last author per line","git reflog":"recover lost HEAD movements"
  };
  const names = Object.keys(cmds);
  for (const c in cmds) add(cat, `What does \`${c}\` do?`, cmds[c], names.filter(x=>x!==c));
  add(cat, "Which command undoes the last commit but keeps changes STAGED?", "git reset --soft HEAD~1", ["git revert HEAD","git clean -fd","git checkout HEAD~1"]);
  add(cat, "Which safely undoes an already-pushed commit with a new inverse commit?", "git revert", ["git reset --hard","git clean","git rm"]);
  add(cat, "Which file lists paths Git should ignore?", ".gitignore", [".gitconfig",".gitexclude",".gitkeep"]);
  add(cat, "Where does \`git commit\` first store the snapshot?", "the local repository", ["the remote","the staging area","the working tree","the index"]);
  add(cat, "The staging area is also known as the", "index", ["HEAD","tree","reflog"]);
  add(cat, "A merge conflict means", "both sides changed the same region", ["the remote is offline","a file was renamed","history is linear","the branch is empty"]);
  add(cat, "After editing conflict markers you resolve by", "git add then commit", ["git clone","git clean","git fetch"]);
  add(cat, "Which creates and switches to a new branch at once?", "git checkout -b feature", ["git branch feature","git merge feature","git push feature"]);
  add(cat, "Which downloads a full new copy of an existing remote repo?", "git clone", ["git init","git fetch","git pull"]);
  addMC(cat, "Which is a distributed VCS (each dev has full history)?", "Git", ["Git","SVN centralized-only","VSS","Perforce-only","CVS"]);
})();

/* ============ SECTION 14 — WEB & SECURITY ============ */
(function sec(){
  const cat = "Web & Security";
  add(cat, "Symmetric encryption uses how many keys?", "one shared secret key", ["a public/private pair","zero","only a hash","two unrelated public keys"]);
  add(cat, "Asymmetric encryption uses", "a public/private key pair", ["one shared key","a single hash","a salt only","no keys"]);
  add(cat, "A cryptographic hash is designed to be", "one-way (irreversible)", ["reversible","symmetric","stateful","decryptable"]);
  add(cat, "Which is a hashing algorithm?", "SHA-256", ["AES-256","RSA-2048","ChaCha20","Blowfish"]);
  add(cat, "Which is a symmetric cipher?", "AES", ["RSA","ECC","Diffie-Hellman","SHA-1"]);
  add(cat, "Which is an asymmetric scheme?", "RSA", ["AES","3DES","Twofish","Serpent"]);
  add(cat, "Best practice to store passwords is", "slow salted hash (bcrypt/argon2)", ["plaintext","reversible encryption","MD5 with no salt","Base64"]);
  add(cat, "A random value added before hashing a password is a", "salt", ["pepper","nonce","IV","token"]);
  add(cat, "A digital signature is generated using the signer's", "private key", ["public key","session key","password","symmetric key"]);
  add(cat, "XSS (Cross-Site Scripting) attacks by", "injecting scripts into trusted pages", ["flooding bandwidth","brute-forcing TLS","reading mail","spoofing MAC"]);
  add(cat, "CSRF makes a victim", "perform unwanted authenticated actions", ["download malware","crash the browser","clear cache","rotate keys"]);
  add(cat, "SQL injection is best prevented with", "parameterized queries", ["hiding the DB name","Base64 of input","obfuscation","disabling TLS"]);
  add(cat, "Which header mitigates clickjacking?", "X-Frame-Options", ["Cache-Control","Content-Length","ETag","Set-Cookie"]);
  add(cat, "A TLS certificate binds a public key to", "an identity/domain", ["a session","a port only","a cookie","a CPU"]);
  add(cat, "CORS controls", "which cross-origin requests a browser permits", ["cache TTL","cookie size","DNS","charset"]);
  add(cat, "Which HTTP method should NOT change server state (safe)?", "GET", ["POST","PUT","DELETE"]);
  add(cat, "TLS mainly provides confidentiality via", "session encryption after key exchange", ["compression","caching","minification","base64"]);
  add(cat, "Two-factor authentication adds a second", "proof-of-identity factor", ["password","cookie","cache","port"]);
  add(cat, "Which is NOT a common auth factor type?", "Randomly generated cache", ["something you know","something you have","something you are"]);
  add(cat, "A JWT is primarily used for", "stateless token authentication", ["storing CSS","DNS resolution","TLS handshakes","gzip"]);
  add(cat, "OAuth 2.0 is an", "authorization (delegated access) framework", ["hash function","cipher suite","web server","cache protocol"]);
  add(cat, "An IDS that alerts on suspicious traffic is a", "intrusion detection system", ["load balancer","cache","CDN","reverse proxy"]);
  add(cat, "A firewall primarily controls traffic by", "rules on ports/addresses", ["DNS","caching","compression","routing tables only"]);
  add(cat, "Which cipher mode adds authentication to encryption?", "AES-GCM", ["AES-ECB","AES-CBC without MAC","Caesar","ROT13"]);
  add(cat, "The weakest, deterministic AES mode for structured data is", "ECB", ["GCM","CTR","CBC-with-random-IV"]);
})();

/* ============ SECTION 15 — CS CONCEPTS & OOP ============ */
(function cs(){
  const cat = "CS Concepts & OOP";
  add(cat, "Encapsulation means", "bundling data with methods and hiding internals", ["deriving subclasses","many method forms","global variables","splitting files"]);
  add(cat, "Inheritance enables", "reusing and extending an existing class", ["hiding state","method overloading only","compilation","garbage collection"]);
  add(cat, "Two functions with the same name but different signatures demonstrate", "overloading (compile-time polymorphism)", ["encapsulation","inheritance","composition","memoization"]);
  add(cat, "A subclass method replacing a parent method is", "overriding (runtime polymorphism)", ["overloading","encapsulation","abstraction","serialization"]);
  add(cat, "A class is best described as", "a blueprint for objects", ["an instance","a variable","a module only","a keyword"]);
  add(cat, "SOLID's 'O' stands for", "Open/Closed principle", ["Object principle","Ordered principle","Observer principle"]);
  add(cat, "SOLID's 'L' stands for", "Liskov Substitution", ["Linkage","Locality","Lambda","Layering"]);
  add(cat, "SOLID's 'D' stands for", "Dependency Inversion", ["Data hiding","Division","Dispatch","Decoupling"]);
  add(cat, "Favoring composition over inheritance mainly improves", "loose coupling", ["runtime memory","compile speed","cache locality","byte size"]);
  add(cat, "A creational pattern limiting a class to one instance is", "Singleton", ["Observer","Strategy","Adapter","Facade"]);
  add(cat, "A pattern that notifies dependents of state change is", "Observer", ["Singleton","Builder","Iterator","Command"]);
  add(cat, "A pattern for interchangeable algorithms is", "Strategy", ["Singleton","Mediator","Visitor","Adapter"]);
  add(cat, "A pattern converting one interface to another is", "Adapter", ["Composite","Observer","Prototype","Flyweight"]);
  add(cat, "Compiled code that runs line-by-line at runtime is", "interpreted", ["compiled","assembled","static","machine-only"]);
  add(cat, "AOT (ahead-of-time) compilation produces", "native code before running", ["runtime parsing","bytecode only","no output","interpreted tokens"]);
  add(cat, "Just-in-time compilation optimizes during", "program execution", ["install only","design only","boot only","linking only"]);
  add(cat, "Strong typing tends to", "reject implicit mixing of unrelated types", ["allow any mixing","remove all casts","skip checks","force pointers"]);
  add(cat, "Static type checking happens at", "compile time", ["runtime only","load time","never","deploy only"]);
  add(cat, "Duck typing decides validity by", "presence of needed methods at runtime", ["declared class","compile errors","static analysis","interfaces only"]);
  add(cat, "Garbage collection manages", "automatic heap memory reclamation", ["CPU scheduling","network buffers","disk sectors","cache lines"]);
  add(cat, "Reference-counting GC struggles most with", "circular references", ["null objects","arrays","strings","threads"]);
  add(cat, "A compiler's final machine-stage output that links objects is", "the linker producing an executable", ["the lexer","the parser","the preprocessor","the REPL"]);
  add(cat, "Which is a LOW-level language?", "Assembly", ["Python","JavaScript","Ruby","SQL"]);
  add(cat, "Idempotent operations guarantee", "same effect applied repeatedly", ["single execution","encryption","caching","compression"]);
  add(cat, "A pure function avoids", "side effects and external state reads", ["returning values","taking inputs","recursion","typing"]);
})();

/* ============ SECTION 16 — CS MATH, LOGIC, DIGITAL ============ */
(function math(){
  const cat = "CS Math & Logic";
  add(cat, "Binary 1010 in decimal is", "10", ["8","10","12","16"]);
  add(cat, "Binary 1101 in decimal is", "13", ["11","12","13","14"]);
  add(cat, "Decimal 25 in binary is", "11001", ["10110","11001","11100","10011"]);
  add(cat, "Decimal 45 in binary is", "101101", ["101101","110101","100111","111010"]);
  add(cat, "Hexadecimal FF in decimal is", "255", ["128","255","256","15"]);
  add(cat, "Hexadecimal 1A in decimal is", "26", ["16","26","10","32"]);
  add(cat, "Decimal 26 in hex is", "1A", ["1A","1B","26","A1"]);
  add(cat, "Hexadecimal 10 in decimal is", "16", ["10","16","17","15"]);
  add(cat, "How many bits are in one byte?", "8", ["4","8","16","32"]);
  add(cat, "How many bytes are in 1 MiB?", "1048576", ["1000000","1048576","65536","1024"]);
  add(cat, "How many bytes are in 1 KiB?", "1024", ["1000","1024","512","2048"]);
  add(cat, "1 byte can represent how many distinct values?", "256", ["128","255","256","1024"]);
  add(cat, "AND of 1100 and 1010 (binary) is", "1000", ["1110","1000","1100","0010"]);
  add(cat, "OR of 1100 and 1010 (binary) is", "1110", ["1000","1110","1100","0001"]);
  add(cat, "XOR of 1100 and 1010 (binary) is", "0110", ["1110","1000","0110","0000"]);
  add(cat, "NOT of binary 1011 (4 bits) is", "0100", ["0100","1011","1111","0111"]);
  add(cat, "1 AND 0 is", "0", ["1","0","true","undefined"]);
  add(cat, "1 OR 0 is", "1", ["0","1","2","false"]);
  add(cat, "1 XOR 1 is", "0", ["1","0","2","true"]);
  add(cat, "A truth table for 3 boolean inputs has how many rows?", "8", ["3","6","8","9"]);
  add(cat, "Which single gate can implement all boolean functions?", "NAND", ["AND","OR","XOR"]);
  add(cat, "De Morgan: NOT(A AND B) equals", "(NOT A) OR (NOT B)", ["(NOT A) AND (NOT B)","A OR B","A AND B","NOT A AND B"]);
  add(cat, "De Morgan: NOT(A OR B) equals", "(NOT A) AND (NOT B)", ["(NOT A) OR (NOT B)","A AND B","A OR B","NOT A OR NOT B only"]);
  add(cat, "A half adder produces a sum and a", "carry", ["borrow","shift","parity bit","clock"]);
  add(cat, "Two's complement is used mainly to represent", "signed integers", ["floats only","characters","pointers only","opcodes"]);
  add(cat, "Which is NOT a valid base-2 numeral?", "102", ["102","1010","111","0"]);
  add(cat, "Which is NOT a valid base-8 (octal) numeral?", "9", ["9","7","17","10"]);
  add(cat, "How many functions map 2 boolean inputs to 1 output?", "16", ["4","8","16","32"]);
  add(cat, "Implication A→B is false only when", "A true and B false", ["A false","B true","both true","both false"]);
})();

/* ============ SECTION 17 — COMPILERS ============ */
(function comp(){
  const cat = "Compilers";
  add(cat, "The lexer (tokenizer) converts source text into", "tokens", ["an AST","machine code","bytecode","registers"]);
  add(cat, "The parser builds a", "parse/abstract syntax tree", ["token stream","register map","linker table","heap"]);
  add(cat, "Semantic analysis primarily checks", "type and scope rules", ["spelling of comments","CPU cache","linking order","font"]);
  add(cat, "The phase emitting target instructions is", "code generation", ["lexical analysis","parsing","preprocessing","debugging"]);
  add(cat, "An intermediate representation exists to", "help portability and optimization", ["hide source","skip parsing","reduce types","encrypt"]);
  add(cat, "Constant folding is which kind of optimization?", "compile-time", ["runtime-only","link-time-only","hardware","never"]);
  add(cat, "Register allocation aims to reduce", "memory spills", ["tokens","comments","lexer states","keywords"]);
  add(cat, "A symbol table stores", "identifier names and their attributes", ["machine opcodes","cache lines","pixel data","packets"]);
  add(cat, "Dead-code elimination removes", "unreachable or unused code", ["all functions","imports only","types","comments"]);
  add(cat, "A stack machine executes bytecode using", "an operand stack", ["registers only","immediate memory","DMA","network"]);
})();

/* ============ SECTION 18 — CLOUD & DEVOPS ============ */
(function devops(){
  const cat = "Cloud & DevOps";
  add(cat, "A container image is built from which recipe file?", "Dockerfile", ["Makefile","build.xml","manifest.json","compose.yaml"]);
  add(cat, "Docker containers share the host's", "kernel", ["CPU only","memory only","filesystem","kernel"]);
  add(cat, "A VM differs from a container mainly because a VM", "has its own guest kernel", ["shares the host kernel","is faster to start","needs no image","cannot run Linux"]);
  add(cat, "docker-compose primarily defines and runs", "multi-container apps", ["single binaries","VMs only","kernels","network cables"]);
  add(cat, "Kubernetes groups containers to be scheduled together in a", "Pod", ["Node","Cluster","Namespace only","Volume"]);
  add(cat, "In Kubernetes, the physical/virtual machine running pods is a", "Node", ["Pod","Cluster","Service","Ingress"]);
  add(cat, "A Kubernetes object exposing a stable internal address to pods is a", "Service", ["ConfigMap","Secret","Volume","Namespace"]);
  add(cat, "Kubernetes automatically replaces failed pods via its", "control plane / reconciler", ["load balancer only","registry","ingress","sidecar"]);
  add(cat, "CI/CD's CI stage mainly automates", "building and testing on each change", ["design","hiring","billing","DNS"]);
  add(cat, "CD in CI/CD commonly means continuous", "delivery or deployment", ["documentation","debugging","coding","drafting"]);
  add(cat, "Infrastructure-as-code with declarative config is exemplified by", "Terraform", ["Photoshop","Blender","GIMP","VLC"]);
  add(cat, "IaC's core benefit over manual setup is", "reproducible, version-controlled environments", ["slower provisioning","manual drift","no rollback","fixed regions"]);
  add(cat, "A monolith split into small independently deployable services is", "microservices", ["monolithic","batch","mainframe","embedded"]);
  add(cat, "Serverless functions are typically", "event-triggered and billed per execution", ["always running VMs","paid flat monthly only","OS kernels","static files"]);
  add(cat, "An S3-style object store keeps data as", "key-addressed blobs with metadata", ["fixed tables","registers","kernel modules","cables"]);
  add(cat, "IaaS differs from PaaS in that the customer also manages", "OS and runtime", ["the datacenter only","the power grid","the network cables","nothing"]);
  add(cat, "A load balancer placed in front of servers primarily improves", "availability and even distribution", ["disk I/O","compilation","font rendering","storage class"]);
  add(cat, "Blue/green deployment aims to", "reduce release risk with instant rollback", ["add latency","hide bugs","double code size","slow CI"]);
  add(cat, "GitOps drives cluster state from", "a git repository as the source of truth", ["emails","manual CLI only","spreadsheets","voice"]);
  add(cat, "A container registry (e.g. Docker Hub) stores", "images and their layers", ["pod YAML","kernels","VM disks","cables"]);
})();

/* ============ SECTION 19 — SOFTWARE ENGINEERING & TESTING ============ */
(function se(){
  const cat = "Software Engineering";
  add(cat, "Unit tests target", "individual functions/classes in isolation", ["whole systems","deployment","UI polish","market fit"]);
  add(cat, "Integration tests verify", "interactions between combined modules", ["single lines","syntax only","one function","code style"]);
  add(cat, "End-to-end tests simulate", "full user journeys across the stack", ["unit methods","compiler passes","lint rules","types only"]);
  add(cat, "Regression tests guard against", "new changes breaking old behavior", ["first releases","feature ideas","hiring","logging"]);
  add(cat, "TDD writes the test", "before the implementation", ["after QA","at deploy","never","manually only"]);
  add(cat, "Code coverage measures", "how much code tests exercise", ["bug count","latency","lines of comments","binary size"]);
  add(cat, "A 'flake' in testing is a test that", "passes and fails nondeterministically", ["never runs","is deleted","is fast","compiles"]);
  add(cat, "The waterfall model is characterized by", "sequential phases with upfront design", ["iterations","no planning","continuous delivery","pairing"]);
  add(cat, "Agile emphasizes", "iterative delivery and feedback", ["big upfront specs","no testing","frozen scope","no demos"]);
  add(cat, "A 'sprint' belongs to which framework?", "Scrum", ["Waterfall","V-model","Spiral","Kanban-only"]);
  add(cat, "Code refactoring changes structure to improve it while keeping", "external behavior", ["runtime speed","language","tests","all names"]);
  add(cat, "High cyclomatic complexity signals", "many independent paths (hard to test)", ["fast code","few bugs","no branches","small binary"]);
  add(cat, "Dependency injection mainly improves", "testability and decoupling", ["cache size","compile time","network","font loading"]);
  add(cat, "Technical debt represents", "future cost from today's shortcuts", ["a loan","a bug ticket","an SLA","a license"]);
  add(cat, "A 'code smell' is", "a symptom suggesting deeper design problems", ["a compiler error","a syntax rule","a runtime crash","a test"]);
  add(cat, "Pair programming involves", "two devs at one task, driver + navigator", ["one dev alone","auto code review","no tests","batch builds"]);
  add(cat, "A pull request is primarily used for", "reviewing proposed changes before merge", ["compiling","deploying secrets","linting only","DNS"]);
  add(cat, "SemVer 2.0.0 bumps the first number for", "breaking changes", ["patches","docs","minor features","typos"]);
})();

/* ============ SECTION 20 — WEB APIS, REST, JSON, HTTP ============ */
(function apis(){
  const cat = "Web APIs";
  add(cat, "A RESTful API is usually transported over", "HTTP", ["FTP","SMTP","SNMP"]);
  add(cat, "REST's statelessness means the server", "stores no client session between calls", ["caches everything","encrypts all","uses WebSockets","needs cookies only"]);
  add(cat, "Which HTTP verb creates a resource?", "POST", ["GET","DELETE","HEAD"]);
  add(cat, "Which HTTP verb reads a resource without side effects?", "GET", ["PUT","PATCH","POST"]);
  add(cat, "Which HTTP verb fully replaces a resource?", "PUT", ["PATCH","GET","OPTIONS"]);
  add(cat, "Which HTTP verb partially updates a resource?", "PATCH", ["PUT","DELETE","HEAD"]);
  add(cat, "Which HTTP verb removes a resource?", "DELETE", ["GET","POST","TRACE"]);
  add(cat, "Which content type carries structured data most common in web APIs?", "application/json", ["image/png","audio/wav","application/x-shockwave"]);
  add(cat, "An HTTP header used for content negotiation of response type is", "Accept", ["Host","Referer","User-Agent"]);
  add(cat, "Which header tells the server the request body's type?", "Content-Type", ["Accept","Cache-Control","Connection"]);
  add(cat, "ETags are used for", "cache validation / conditional requests", ["auth","routing","DNS","compression"]);
  add(cat, "Which header prevents browsers from caching a response?", "Cache-Control: no-store", ["Accept","ETag","Set-Cookie"]);
  add(cat, "A 4xx with body 'validation failed' is best paired with which status?", "422 Unprocessable Entity", ["200 OK","301 Moved","503"]);
  add(cat, "REST collections are typically addressed as", "nouns (e.g. /users)", ["verbs (/getUser)","ip only","ports","cookies"]);
  add(cat, "Query parameters appear in a URL after", "a ?", "a #","a ;","a /");
  add(cat, "URL path segments are separated by", "/", ["?","#",":"]);
  add(cat, "Which protocol offers persistent bidirectional push between browser and server?", "WebSocket", ["HTTP/1 GET","FTP","SMTP"]);
  add(cat, "GraphQL differs from REST by", "letting clients query exactly the fields they need", ["only GET verbs","binary payloads","no server","caching only"]);
})();

/* ============ SECTION 21 — REGEX & STRINGS ============ */
(function regex(){
  const cat = "Programming Concepts";
  add(cat, "In regex, the anchor ^ matches", "start of the string/line", ["end of string","a digit","any char","a space"]);
  add(cat, "In regex, the anchor $ matches", "end of the string/line", ["start","a word","a digit","literal $"]);
  add(cat, "In regex, \\d matches", "a digit", ["any char","a word","a space","a dot"]);
  add(cat, "In regex, \\w matches", "a word character (letter/digit/_)", ["whitespace","punctuation","any char","a dot"]);
  add(cat, "In regex, . matches", "any character except newline (by default)", ["only digits","a literal dot","whitespace only","start of line"]);
  add(cat, "The quantifier {3} means", "exactly three repetitions", ["three or more","zero to three","at most three","a set"]);
  add(cat, "The quantifier + means", "one or more", ["zero or more","optional","exactly one","none"]);
  add(cat, "The quantifier * means", "zero or more", ["one or more","optional only","exactly zero","never"]);
  add(cat, "The quantifier ? means", "zero or one (optional)", ["one or more","exactly one","greedy","never"]);
  add(cat, "By default regex quantifiers are", "greedy (match as much as possible)", ["lazy","fixed","random","disabled"]);
  add(cat, "Making a quantifier lazy uses which suffix?", "?", ["*","+","$"]);
  add(cat, "The character class [abc] matches", "any one of a, b or c", ["only abc in order","none of them","a literal bracket","always a"]);
  add(cat, "The negated class [^0-9] matches", "any character that is NOT a digit", ["only digits","a literal ^","the caret","nothing"]);
})();

/* ============ SECTION 22 — BITWISE, BINARY, MISC ============ */
(function misc(){
  const cat = "Programming Concepts";
  add(cat, "Left-shifting an integer by 1 multiplies it by", "2", ["2","4","8","10"]);
  add(cat, "Right-shifting a positive integer by 2 divides it by", "4", ["2","4","8","16"]);
  add(cat, "x XOR x equals", "0", ["x","1","0","-1"]);
  add(cat, "x AND 0 equals", "0", ["x","1","0","0xff"]);
  add(cat, "x OR 0xFFFF (16 bits) equals", "0xFFFF", ["0","x","0xFFFF","undefined"]);
  add(cat, "A mask to keep only the low 8 bits is", "x & 0xFF", ["x | 0xFF","x ^ 0x01","x >> 8"]);
  add(cat, "A bitmask stores several booleans in one integer using", "individual bits", ["bytes","chars","lines","files"]);
  add(cat, "Endianness describes", "byte order in memory", ["bit rate","clock speed","file system","cache policy"]);
  add(cat, "Big-endian stores the most significant byte", "first (lowest address)", ["last","never","randomly","twice"]);
  add(cat, "Two's complement of a byte is used to", "represent negative integers", ["compress","encrypt","hash","sort"]);
  add(cat, "A race condition requires", "concurrent access to shared mutable state", ["disk","a single thread","determinism","no memory"]);
  add(cat, "A deadlock is a special case of", "a livelock-free circular wait among threads", ["a cache hit","a compile","a network storm","a GC pause"]);
  add(cat, "Memoization trades memory for", "speed by reusing results", ["security","disk","network","fonts"]);
  add(cat, "Pure functions make testing easier because they are", "deterministic given inputs", ["random","stateful","hidden","compiled"]);
  add(cat, "A stack overflow in recursion is caused by", "no/reached base case or too-deep recursion", ["a fast CPU","large heap","balanced trees","cache misses"]);
  add(cat, "Which error is thrown by accessing an array index out of range at runtime?", "IndexError/ArrayIndexOutOfBounds", ["TypeError","SyntaxError","ReferenceError","OverflowError"]);
})();

/* ============ WRITE + VALIDATE ============ */

/* ============ SECTION 23 — FINAL BOOST (mixed) ============ */
(function boost(){
  const DS = "Data Structures";
  add(DS, "A complete binary tree of height h (root at 0) has at most how many nodes?", "2^(h+1) - 1", ["2^h", "2h", "h^2"]);
  add(DS, "In a heap stored in an array, the parent of node i is at index", "floor((i-1)/2)", ["2i+1", "i/2", "i-1"]);
  add(DS, "In a heap stored in an array, the left child of node i is at index", "2i+1", ["i+2", "floor((i-1)/2)", "2i"]);
  add(DS, "A simple undirected graph on V vertices has at most how many edges?", "V(V-1)/2", ["V^2", "V(V+1)/2", "V-1"]);
  add(DS, "A tree with V vertices always has exactly how many edges?", "V-1", ["V", "V+1", "2V"]);
  add(DS, "The sum of all vertex degrees in an undirected graph equals", "twice the number of edges", ["the number of edges", "vertices minus one", "edges squared"]);
  add(DS, "AVL trees keep balance by restricting each node's balance factor to", "-1, 0 or +1", ["0 only", "-2..+2", "any value"]);
  add(DS, "A full binary tree is one in which every node has", "0 or 2 children", ["exactly 1 child", "at most 1 child", "exactly 3 children"]);
  const JS = "JavaScript";
  add(JS, "typeof NaN evaluates to", "\"number\"", ["\"NaN\"", "\"undefined\"", "\"object\""]);
  add(JS, "A closure gives an inner function access to", "variables of its outer function's scope", ["the DOM only","global scripts only","other tabs","the console"]);
  add(JS, "Promise callbacks (microtasks) run", "before the next macrotask / setTimeout", ["after setTimeout","only on page load","during parsing","inside rAF only"]);
  add(JS, "Array.map returns", "a new array of the same length", ["the original mutated","a single value","undefined","a boolean"]);
  add(JS, "Array.filter returns", "only the elements that pass the test", ["the first match","a single accumulated value","the array sorted","true/false"]);
  add(JS, "Array.reduce produces", "a single accumulated value", ["a new array","undefined per item","a Set","a sorted copy"]);
  add(JS, "Which copies own enumerable properties into a target object?", "Object.assign", ["Object.freeze","Object.entries","Array.from"]);
  add(JS, "[1,2] === [1,2] evaluates to", "false", ["true","NaN","undefined","a TypeError"]);
  const DB = "Databases & SQL";
  add(DB, "ACID's 'I' stands for", "Isolation", ["Indexing","Integrity","Iteration","Instantness"]);
  add(DB, "ACID's 'D' stands for", "Durability", ["Distribution","Duplication","Deadlock","Denormalization"]);
  add(DB, "A FOREIGN KEY enforces", "referential integrity between tables", ["column order","unique widths","row colors","index speed"]);
  add(DB, "Unlike a PRIMARY KEY, a UNIQUE key allows", "one NULL value (per column set)", ["duplicate rows","no indexes","table locks","auto increments"]);
  add(DB, "A view is best described as", "a stored query presented like a table", ["a backup file","an index type","a trigger","a schema"]);
  add(DB, "Write-ahead logging (WAL) exists mainly to", "recover after crashes safely", ["compress data","sort rows","cache queries","shard tables"]);
  add(DB, "A key-value NoSQL store (e.g. Redis) excels at", "fast simple lookups by key", ["complex joins","multi-row transactions","table schemas","graph traversal only"]);
  add(DB, "Third normal form (3NF) removes", "transitive dependencies of non-keys on non-keys", ["all indexes","duplicate rows","joins","NULLs"]);
  const OS = "Operating Systems";
  add(OS, "A page fault occurs when", "a referenced page is not in physical RAM", ["the disk is full","a syscall runs","the CPU overheats","RAM doubles"]);
  add(OS, "The TLB caches", "virtual-to-physical page translations", ["disk blocks","file names","process ids","interrupts"]);
  add(OS, "Belady's anomaly can appear under which replacement policy?", "FIFO", ["LRU","OPT","LFU-with-aging","MRU"]);
  add(OS, "In round-robin scheduling, making the quantum very small mainly", "increases context-switch overhead", ["stops preemption","removes starvation","helps I/O bound tasks only","dedicates the CPU"]);
  add(OS, "A daemon process typically", "runs in the background without a terminal", ["needs a GUI","dies with the shell","is a shell alias","has PID 0 only"]);
  add(OS, "Swapping moves processes between RAM and", "disk", ["cache","registers","ROM","the GPU"]);
  const GIT = "Git & Version Control";
  add(GIT, "git bisect is used to", "find the commit that introduced a bug", ["delete history","rename branches","encrypt commits","compress the repo"]);
  add(GIT, "git stash is used to", "shelve uncommitted changes temporarily", ["publish the repo","undo the last commit","remove a remote","create a tag"]);
  add(GIT, "git rebase differs from git merge by", "rewriting commits onto a new base", ["deleting the branch","removing the origin","disabling the history","zipping files"]);
  add(GIT, "An annotated tag differs from a lightweight tag because it", "stores extra metadata as its own object", ["is faster","cannot be pushed","is always signed","deletes branches"]);
  const MATH = "CS Math & Logic";
  add(MATH, "Euclid's algorithm computes", "the greatest common divisor", ["the least common multiple only","prime factors","a factorial","modular inverse never"]);
  add(MATH, "n! equals 720 for n =", "6", ["5","7","8","9"]);
  add(MATH, "The number of permutations of 3 items from 5 (5P3) is", "60", ["10","20","120","15"]);
  add(MATH, "17 mod 5 equals", "2", ["3","1","0","7"]);
  add(MATH, "A proposition that is true for every valuation is a", "tautology", ["contradiction","contingency","lemma","corollary"]);
  const CMP = "Compilers";
  add(CMP, "The lexer (scanner) phase turns source text into", "tokens", ["machine code","an AST","three-address code","register allocation"]);
  add(CMP, "The parser phase builds", "a syntax/abstract tree from tokens", ["tokens from chars","object files","the symbol table only","optimized asm"]);
  add(CMP, "Syntax errors are detected primarily by the", "parser", ["linker","loader","optimizer","assembler"]);
  add(CMP, "A peephole optimization works on", "small windows of generated instructions", ["source comments","the build order","the lexer regexes","file names"]);
  const NET = "Networking";
  add(NET, "A classic MAC-filtering weakness is", "MAC addresses can be spoofed", ["they are 64-bit","they are encrypted","they change hourly","they are public keys"]);
  add(NET, "In IPv6 notation, what does the double colon :: mean?", "compression of consecutive zero groups", ["a wildcard port","an invalid address","the loopback only"]);
  add(NET, "DNS record type A maps a name to", "an IPv4 address", ["an IPv6 address","a mail server","a text note","a canonical name"]);
  add(NET, "DNS record type AAAA maps a name to", "an IPv6 address", ["an IPv4 address","a certificate","a PTR only","a TXT"]);
  add(NET, "The loopback address 127.0.0.1 refers to", "the local machine", ["the router","the DNS server","the default gateway","a remote host"]);
  add(NET, "A CDN primarily reduces latency by", "caching content at edge servers", ["encrypting traffic","sharding databases","compiling JS","blocking cookies"]);
  const CLD = "Cloud & DevOps";
  add(CLD, "Auto-scaling in the cloud means", "instances grow/shrink with demand", ["fixed capacity","manual backups","static DNS","frozen images"]);
  add(CLD, "A cloud region typically contains multiple", "availability zones", ["datacenter cables per floor","operating systems","browsers","IP versions only"]);
  add(CLD, "Immutable infrastructure prefers", "replacing servers instead of patching them live", ["SSH hotfixes","manual edits","stateful upgrades","edits to prod"]);
  add(CLD, "A managed database service mainly removes the need to", "patch and back up servers yourself", ["write queries","design schemas","model data","use SQL"]);
  const SEC = "Web & Security";
  add(SEC, "Salting password hashes defends against", "rainbow-table lookups", ["brute force entirely","phishing","DDoS","SQL injection"]);
  add(SEC, "The principle of least privilege grants", "only the access strictly needed", ["admin to all","root by default","shared passwords","full disk access"]);
  add(SEC, "Defense in depth means", "layering multiple security controls", ["one strong firewall","no monitoring","single password","offline storage only"]);
  add(SEC, "Rate limiting an API endpoint mainly mitigates", "brute-force and abuse floods", ["XSS payloads","plain leaks","bad CSS","DNS caching"]);
  const SE2 = "Software Engineering";
  add(SE2, "A smoke test checks", "basic functionality before deeper testing", ["every edge case","performance only","style only","security headers"]);
  add(SE2, "A canary release rolls out", "to a small user slice first", ["to nobody","to the whole base at once","only to devs","after downtime"]);
  add(SE2, "'Definition of Done' primarily standardizes", "when a team agrees work is complete", ["the sprint length","the language","the logo","the IDE"]);
  add(SE2, "An MVP is", "the smallest usable product to validate demand", ["a full release","a mockup in Figma","a bug bash","a rewrite"]);
  const PC = "Programming Concepts";
  add(PC, "An API key identifies", "the calling application/client", ["the end user's face","a browser tab","the CPU model","the IP version"]);
  add(PC, "API rate limits are commonly reported via which headers?", "X-RateLimit-* / RateLimit-*", ["Content-Type","ETag","Set-Cookie","Referer"]);
  add(PC, "A 'breaking change' in an API means", "existing clients may stop working", ["a new color","docs only","a typo fix","a rename of a private var"]);
  add(PC, "Semantic versioning's three numbers are", "major.minor.patch", ["year.month.day","big.medium.small","alpha.beta.gamma","1, 2, 3 fixed"]);
})();

const total = BANK.length;
const counts = {};
BANK.forEach(q => (counts[q.cat] = (counts[q.cat] || 0) + 1));
const cats = Object.keys(counts).sort();

/* integrity */
let errors = [];
const seenStem = new Map();
BANK.forEach((q, i) => {
  if (!q || typeof q.q !== "string") return errors.push(`bad item @${i}`);
  if (!Array.isArray(q.opts) || q.opts.length !== 4) return errors.push(`opts!=4: ${q.q}`);
  if (new Set(q.opts.map(String)).size !== 4) return errors.push(`dup opts: ${q.q}`);
  if (q.a < 0 || q.a > 3) return errors.push(`bad idx: ${q.q}`);
  const k = q.q.trim().toLowerCase();
  if (seenStem.has(k)) errors.push(`dup stem: ${q.q} (also #${seenStem.get(k)})`);
  else seenStem.set(k, i);
});
if (errors.length){ console.error("\u2718 INTEGRITY ERRORS:\n" + errors.join("\n")); process.exit(1); }
if (total < 1000){ console.error(`\u2718 Only ${total} questions (<1000). Counts:`, counts); process.exit(1); }

const out = `/* Musicomp \u2014 CS Fundamentals question bank: ${total} unique questions across ${cats.length} categories.\n   Auto-generated by gen_questions.js. Do not hand-edit. */\nwindow.QUESTION_BANK = ${JSON.stringify(BANK)};\n`;
fs.writeFileSync("questions.js", out);

console.log(`\u2714 Generated ${total} unique questions across ${cats.length} categories -> questions.js (${(out.length/1024).toFixed(0)} KB)`);
cats.forEach(c => console.log(`   \u2022 ${c}: ${counts[c]}`));
