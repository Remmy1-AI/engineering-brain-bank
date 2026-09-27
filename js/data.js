/* Engineering Brain Bank — Mock Data Library
   Hierarchy: Department → Level → Semester → Course → Materials
   Ghana / KNUST-flavoured sample content for KB4GESA / Korle Boye
*/

const EBB = {
  brand: {
    short: "KB4GESA",
    name: "Engineering Brain Bank",
    tagline: "Learn • Share • Succeed",
    purpose: "One centralized place for engineering students to find and share slides, notes, and past questions under KB4GESA.",
    closing: "From Korle Boye, For Korle Boye.",
  },

  departments: [
    { id: "civil", name: "Civil Engineering", short: "Civil", code: "CE", icon: "🏗", count: 42 },
    { id: "electrical", name: "Electrical Engineering", short: "Electrical", code: "EE", icon: "⚡", count: 18 },
    { id: "mechanical", name: "Mechanical Engineering", short: "Mechanical", code: "ME", icon: "⚙", count: 35 },
    { id: "computer", name: "Computer Engineering", short: "Computer", code: "COE", icon: "💻", count: 89 },
    { id: "chemical", name: "Chemical Engineering", short: "Chemical", code: "CHE", icon: "⚗", count: 12 },
    { id: "industrial", name: "Industrial Engineering", short: "Industrial", code: "IE", icon: "🏭", count: 27 },
  ],

  levels: [
    { id: "100", name: "Level 100", year: 1 },
    { id: "200", name: "Level 200", year: 2 },
    { id: "300", name: "Level 300", year: 3 },
    { id: "400", name: "Level 400", year: 4 },
  ],

  semesters: [
    { id: "1", name: "Semester 1" },
    { id: "2", name: "Semester 2" },
  ],

  materialTypes: [
    { id: "slides", name: "Course Slides", icon: "📊" },
    { id: "notes", name: "Lecture Notes", icon: "📝" },
    { id: "past-questions", name: "Past Questions", icon: "📋" },
    { id: "shared", name: "Shared by Students", icon: "🤝" },
  ],

  courses: [
    // Civil — Level 400
    {
      id: "ce-401",
      code: "CE 401",
      name: "Structural Analysis II",
      department: "civil",
      level: "400",
      semester: "1",
      lecturer: "Prof. Kofi Mensah",
      accessCount: 1240,
      description: "Advanced structural analysis methods including matrix methods and finite element concepts.",
    },
    {
      id: "ce-403",
      code: "CE 403",
      name: "Structural Analysis",
      department: "civil",
      level: "400",
      semester: "1",
      lecturer: "Dr. Ama Owusu",
      accessCount: 980,
      description: "Foundation design, slope stability, and earth retaining structures.",
    },
    {
      id: "ce-405",
      code: "CE 405",
      name: "Highway Engineering",
      department: "civil",
      level: "400",
      semester: "1",
      lecturer: "Ing. Yaw Boateng",
      accessCount: 875,
      description: "Highway planning, geometric design, and pavement materials.",
    },
    {
      id: "ce-462",
      code: "CE 462",
      name: "Water Resources Engineering",
      department: "civil",
      level: "400",
      semester: "2",
      lecturer: "Dr. Efua Addo",
      accessCount: 720,
      description: "Hydrology, hydraulic structures, and water supply systems.",
    },
    {
      id: "ce-301",
      code: "CE 301",
      name: "Strength of Materials",
      department: "civil",
      level: "300",
      semester: "1",
      lecturer: "Dr. Kwame Asante",
      accessCount: 1100,
      description: "Stress, strain, torsion, and beam deflection theory.",
    },
    {
      id: "ce-251",
      code: "CE 251",
      name: "Fluid Mechanics",
      department: "civil",
      level: "200",
      semester: "2",
      lecturer: "Mr. Samuel Darko",
      accessCount: 640,
      description: "Properties of fluids, hydrostatics, and pipe flow.",
    },
    {
      id: "ce-151",
      code: "CE 151",
      name: "Engineering Drawing",
      department: "civil",
      level: "100",
      semester: "1",
      lecturer: "Ing. Patricia Amoah",
      accessCount: 1500,
      description: "Orthographic projection, isometric drawing, and CAD basics.",
    },

    // Electrical
    {
      id: "ee-301",
      code: "EE 301",
      name: "Power Systems I",
      department: "electrical",
      level: "300",
      semester: "1",
      lecturer: "Prof. Joseph Appiah",
      accessCount: 890,
      description: "Generation, transmission, and distribution of electrical power.",
    },
    {
      id: "ee-351",
      code: "EE 351",
      name: "Control Systems",
      department: "electrical",
      level: "300",
      semester: "2",
      lecturer: "Dr. Rita Nkrumah",
      accessCount: 760,
      description: "Feedback control, transfer functions, and stability analysis.",
    },
    {
      id: "ee-201",
      code: "EE 201",
      name: "Circuit Theory II",
      department: "electrical",
      level: "200",
      semester: "1",
      lecturer: "Ing. Francis Osei",
      accessCount: 920,
      description: "AC circuits, phasors, and network theorems.",
    },
    {
      id: "ee-401",
      code: "EE 401",
      name: "Electrical Machines II",
      department: "electrical",
      level: "400",
      semester: "1",
      lecturer: "Prof. Daniel Adjei",
      accessCount: 540,
      description: "Synchronous machines, induction motors, and special machines.",
    },

    // Mechanical
    {
      id: "me-321",
      code: "ME 321",
      name: "Thermodynamics",
      department: "mechanical",
      level: "300",
      semester: "1",
      lecturer: "Dr. Nana Frimpong",
      accessCount: 1050,
      description: "Gas and vapour power cycles, refrigeration, and psychrometrics.",
    },
    {
      id: "me-401",
      code: "ME 401",
      name: "Machine Design",
      department: "mechanical",
      level: "400",
      semester: "1",
      lecturer: "Ing. Gloria Tetteh",
      accessCount: 830,
      description: "Design of machine elements: shafts, bearings, gears, and fasteners.",
    },
    {
      id: "me-251",
      code: "ME 251",
      name: "Manufacturing Processes",
      department: "mechanical",
      level: "200",
      semester: "2",
      lecturer: "Mr. Eric Bonsu",
      accessCount: 610,
      description: "Casting, machining, welding, and forming processes.",
    },
    {
      id: "me-351",
      code: "ME 351",
      name: "Fluid Machinery",
      department: "mechanical",
      level: "300",
      semester: "2",
      lecturer: "Dr. Akosua Sarpong",
      accessCount: 480,
      description: "Pumps, turbines, compressors, and dimensional analysis.",
    },
    {
      id: "ge-402",
      code: "GE 402",
      name: "Engineering Management",
      department: "mechanical",
      level: "400",
      semester: "2",
      lecturer: "Prof. Isaac Quaye",
      accessCount: 700,
      description: "Project management, operations research, and engineering economy.",
    },

    // Computer Engineering
    {
      id: "coe-251",
      code: "COE 251",
      name: "Data Structures & Algorithms",
      department: "computer",
      level: "200",
      semester: "1",
      lecturer: "Dr. Michael Adu",
      accessCount: 2100,
      description: "Arrays, linked lists, trees, graphs, sorting, and complexity analysis.",
    },
    {
      id: "coe-358",
      code: "COE 358",
      name: "Computer Networks",
      department: "computer",
      level: "300",
      semester: "2",
      lecturer: "Ing. Belinda Owusu",
      accessCount: 1450,
      description: "OSI/TCP-IP models, routing, switching, and network security basics.",
    },
    {
      id: "coe-381",
      code: "COE 381",
      name: "Embedded Systems",
      department: "computer",
      level: "300",
      semester: "1",
      lecturer: "Dr. Kwesi Ampofo",
      accessCount: 980,
      description: "Microcontrollers, RTOS concepts, and interfacing.",
    },
    {
      id: "coe-457",
      code: "COE 457",
      name: "Artificial Intelligence",
      department: "computer",
      level: "400",
      semester: "1",
      lecturer: "Prof. Abena Gyasi",
      accessCount: 1680,
      description: "Search algorithms, knowledge representation, ML fundamentals.",
    },
    {
      id: "coe-272",
      code: "COE 272",
      name: "Digital Systems Design",
      department: "computer",
      level: "200",
      semester: "2",
      lecturer: "Ing. Patrick Mensah",
      accessCount: 1120,
      description: "Combinational/sequential logic, HDL, and FPGA introduction.",
    },
    {
      id: "coe-101",
      code: "COE 101",
      name: "Introduction to Computing",
      department: "computer",
      level: "100",
      semester: "1",
      lecturer: "Ms. Felicia Boateng",
      accessCount: 2300,
      description: "Computer organization, programming fundamentals, and software tools.",
    },
    {
      id: "coe-451",
      code: "COE 451",
      name: "Software Engineering",
      department: "computer",
      level: "400",
      semester: "1",
      lecturer: "Dr. Ernest Oppong",
      accessCount: 1340,
      description: "SDLC, requirements, design patterns, testing, and agile methods.",
    },

    // Chemical
    {
      id: "che-301",
      code: "CHE 301",
      name: "Chemical Reaction Engineering",
      department: "chemical",
      level: "300",
      semester: "1",
      lecturer: "Prof. Grace Antwi",
      accessCount: 420,
      description: "Reactor design, kinetics, and catalysis.",
    },
    {
      id: "che-251",
      code: "CHE 251",
      name: "Transport Phenomena",
      department: "chemical",
      level: "200",
      semester: "2",
      lecturer: "Dr. Felix Ankomah",
      accessCount: 380,
      description: "Momentum, heat, and mass transfer.",
    },
    {
      id: "che-401",
      code: "CHE 401",
      name: "Process Control",
      department: "chemical",
      level: "400",
      semester: "1",
      lecturer: "Ing. Linda Owusu",
      accessCount: 350,
      description: "Process dynamics, feedback control, and instrumentation.",
    },

    // Industrial
    {
      id: "ie-301",
      code: "IE 301",
      name: "Operations Research",
      department: "industrial",
      level: "300",
      semester: "1",
      lecturer: "Dr. Charles Agyei",
      accessCount: 560,
      description: "Linear programming, queuing theory, and inventory models.",
    },
    {
      id: "ie-351",
      code: "IE 351",
      name: "Quality Control",
      department: "industrial",
      level: "300",
      semester: "2",
      lecturer: "Ms. Joyce Mensah",
      accessCount: 440,
      description: "SPC, Six Sigma concepts, and acceptance sampling.",
    },
    {
      id: "ie-401",
      code: "IE 401",
      name: "Production Planning",
      department: "industrial",
      level: "400",
      semester: "1",
      lecturer: "Ing. Robert Owusu",
      accessCount: 390,
      description: "MRP, capacity planning, and lean manufacturing.",
    },
    {
      id: "ie-201",
      code: "IE 201",
      name: "Work Study & Ergonomics",
      department: "industrial",
      level: "200",
      semester: "1",
      lecturer: "Mr. Victor Addae",
      accessCount: 310,
      description: "Method study, work measurement, and human factors.",
    },
  ],

  materials: [
    // CE 401
    { id: "m1", courseId: "ce-401", type: "slides", topic: "Matrix Methods of Structural Analysis", title: "Week 1–3 Slides: Matrix Stiffness Method", lecturer: "Prof. Kofi Mensah", uploadedBy: "KB4GESA Admin", date: "2025-09-12", downloads: 340, fileName: "CE401_Matrix_Methods.pdf", size: "2.4 MB" },
    { id: "m2", courseId: "ce-401", type: "notes", topic: "Finite Element Introduction", title: "Lecture Notes — Intro to FEM", lecturer: "Prof. Kofi Mensah", uploadedBy: "Ama Korle", date: "2025-10-02", downloads: 210, fileName: "CE401_FEM_Notes.pdf", size: "1.1 MB" },
    { id: "m3", courseId: "ce-401", type: "past-questions", topic: "End of Semester Exam", title: "CE 401 Past Questions 2020–2024", lecturer: "Prof. Kofi Mensah", uploadedBy: "Yaw Boateng", date: "2025-11-15", downloads: 890, fileName: "CE401_PQ_2020-2024.pdf", size: "3.8 MB" },
    { id: "m4", courseId: "ce-401", type: "shared", topic: "Tutorial Solutions", title: "Student Solutions Pack — Tutorial Set A", lecturer: "Prof. Kofi Mensah", uploadedBy: "Korle Boye Study Group", date: "2026-01-08", downloads: 156, fileName: "CE401_Tutorial_Solutions.pdf", size: "890 KB" },

    // CE 403
    { id: "m5", courseId: "ce-403", type: "slides", topic: "Shallow Foundations", title: "Foundation Design Slides", lecturer: "Dr. Ama Owusu", date: "2025-09-20", uploadedBy: "KB4GESA Admin", downloads: 280, fileName: "CE403_Foundations.pdf", size: "3.1 MB" },
    { id: "m6", courseId: "ce-403", type: "past-questions", topic: "Mid-Semester Exam", title: "CE 403 Mid-Sem Past Papers", lecturer: "Dr. Ama Owusu", date: "2025-10-18", uploadedBy: "Efua Addo", downloads: 520, fileName: "CE403_MidSem.pdf", size: "1.5 MB" },
    { id: "m7", courseId: "ce-403", type: "notes", topic: "Slope Stability", title: "Slope Stability Analysis Notes", lecturer: "Dr. Ama Owusu", date: "2025-11-01", uploadedBy: "Kwame Asante", downloads: 190, fileName: "CE403_Slope_Notes.pdf", size: "2.0 MB" },

    // CE 405
    { id: "m8", courseId: "ce-405", type: "slides", topic: "Geometric Design of Highways", title: "Highway Geometric Design — Full Slides", lecturer: "Ing. Yaw Boateng", date: "2025-09-08", uploadedBy: "KB4GESA Admin", downloads: 410, fileName: "CE405_Geometric.pdf", size: "4.2 MB" },
    { id: "m9", courseId: "ce-405", type: "past-questions", topic: "End of Semester", title: "CE 405 Past Questions Compilations", lecturer: "Ing. Yaw Boateng", date: "2026-02-10", uploadedBy: "Patricia Amoah", downloads: 670, fileName: "CE405_PQ.pdf", size: "2.7 MB" },

    // CE 462
    { id: "m10", courseId: "ce-462", type: "notes", topic: "Open Channel Flow", title: "Hydraulics Lecture Notes", lecturer: "Dr. Efua Addo", date: "2026-01-20", uploadedBy: "Samuel Darko", downloads: 145, fileName: "CE462_OpenChannel.pdf", size: "1.8 MB" },
    { id: "m11", courseId: "ce-462", type: "slides", topic: "Dams & Spillways", title: "Hydraulic Structures Slides", lecturer: "Dr. Efua Addo", date: "2026-02-05", uploadedBy: "KB4GESA Admin", downloads: 98, fileName: "CE462_Dams.pdf", size: "5.1 MB" },

    // CE 301
    { id: "m12", courseId: "ce-301", type: "slides", topic: "Stress & Strain", title: "SOM Week 1–4 Slides", lecturer: "Dr. Kwame Asante", date: "2025-09-05", uploadedBy: "KB4GESA Admin", downloads: 560, fileName: "CE301_Stress_Strain.pdf", size: "2.9 MB" },
    { id: "m13", courseId: "ce-301", type: "past-questions", topic: "End of Semester", title: "CE 301 Past Questions 2018–2025", lecturer: "Dr. Kwame Asante", date: "2025-12-01", uploadedBy: "Korle Boye Archive", downloads: 1200, fileName: "CE301_PQ.pdf", size: "4.0 MB" },
    { id: "m14", courseId: "ce-301", type: "notes", topic: "Beam Deflection", title: "Macaulay's Method Notes", lecturer: "Dr. Kwame Asante", date: "2025-10-22", uploadedBy: "Ama Korle", downloads: 330, fileName: "CE301_Deflection.pdf", size: "960 KB" },

    // ME 321
    { id: "m15", courseId: "me-321", type: "slides", topic: "Rankine Cycle", title: "Vapour Power Cycles Slides", lecturer: "Dr. Nana Frimpong", date: "2025-09-15", uploadedBy: "KB4GESA Admin", downloads: 480, fileName: "ME321_Rankine.pdf", size: "3.3 MB" },
    { id: "m16", courseId: "me-321", type: "past-questions", topic: "End of Semester", title: "ME 321 Past Questions Pack", lecturer: "Dr. Nana Frimpong", date: "2026-01-12", uploadedBy: "Eric Bonsu", downloads: 750, fileName: "ME321_PQ.pdf", size: "2.2 MB" },
    { id: "m17", courseId: "me-321", type: "notes", topic: "Refrigeration Cycles", title: "Vapour Compression Notes", lecturer: "Dr. Nana Frimpong", date: "2025-11-08", uploadedBy: "Akosua Sarpong", downloads: 220, fileName: "ME321_Refrigeration.pdf", size: "1.4 MB" },

    // GE 402
    { id: "m18", courseId: "ge-402", type: "slides", topic: "Project Management", title: "PMBOK Essentials for Engineers", lecturer: "Prof. Isaac Quaye", date: "2026-01-25", uploadedBy: "KB4GESA Admin", downloads: 310, fileName: "GE402_PM.pdf", size: "2.6 MB" },
    { id: "m19", courseId: "ge-402", type: "past-questions", topic: "End of Semester", title: "GE 402 Past Exam Papers", lecturer: "Prof. Isaac Quaye", date: "2026-03-01", uploadedBy: "Gloria Tetteh", downloads: 400, fileName: "GE402_PQ.pdf", size: "1.9 MB" },

    // COE courses
    { id: "m20", courseId: "coe-251", type: "slides", topic: "Trees & Graphs", title: "DSA — Trees, Heaps & Graphs", lecturer: "Dr. Michael Adu", date: "2025-09-10", uploadedBy: "KB4GESA Admin", downloads: 980, fileName: "COE251_Trees_Graphs.pdf", size: "3.5 MB" },
    { id: "m21", courseId: "coe-251", type: "notes", topic: "Sorting Algorithms", title: "Sorting Complexity Cheat Sheet", lecturer: "Dr. Michael Adu", date: "2025-10-05", uploadedBy: "Belinda Owusu", downloads: 720, fileName: "COE251_Sorting.pdf", size: "450 KB" },
    { id: "m22", courseId: "coe-251", type: "past-questions", topic: "End of Semester", title: "COE 251 Past Questions 2019–2025", lecturer: "Dr. Michael Adu", date: "2025-12-20", uploadedBy: "Korle Boye Archive", downloads: 1600, fileName: "COE251_PQ.pdf", size: "3.2 MB" },
    { id: "m23", courseId: "coe-251", type: "shared", topic: "Lab Solutions", title: "Lab 3–5 Student Solutions (C++)", lecturer: "Dr. Michael Adu", date: "2026-02-14", uploadedBy: "COE Study Circle", downloads: 410, fileName: "COE251_Labs.zip", size: "1.2 MB" },

    { id: "m24", courseId: "coe-358", type: "slides", topic: "TCP/IP Stack", title: "Computer Networks — Full Slide Deck", lecturer: "Ing. Belinda Owusu", date: "2025-09-18", uploadedBy: "KB4GESA Admin", downloads: 640, fileName: "COE358_Networks.pdf", size: "6.0 MB" },
    { id: "m25", courseId: "coe-358", type: "past-questions", topic: "Mid & End Sem", title: "COE 358 Exam Pack", lecturer: "Ing. Belinda Owusu", date: "2026-01-30", uploadedBy: "Kwesi Ampofo", downloads: 880, fileName: "COE358_PQ.pdf", size: "2.1 MB" },

    { id: "m26", courseId: "coe-457", type: "slides", topic: "Search Algorithms", title: "AI — Uninformed & Informed Search", lecturer: "Prof. Abena Gyasi", date: "2025-09-22", uploadedBy: "KB4GESA Admin", downloads: 790, fileName: "COE457_Search.pdf", size: "4.4 MB" },
    { id: "m27", courseId: "coe-457", type: "notes", topic: "Machine Learning Basics", title: "Supervised Learning Summary Notes", lecturer: "Prof. Abena Gyasi", date: "2025-11-12", uploadedBy: "Ernest Oppong", downloads: 550, fileName: "COE457_ML_Notes.pdf", size: "1.7 MB" },
    { id: "m28", courseId: "coe-457", type: "past-questions", topic: "End of Semester", title: "COE 457 Past Questions", lecturer: "Prof. Abena Gyasi", date: "2026-02-20", uploadedBy: "Felicia Boateng", downloads: 1100, fileName: "COE457_PQ.pdf", size: "2.8 MB" },

    { id: "m29", courseId: "coe-381", type: "slides", topic: "ARM Architecture", title: "Embedded Systems — ARM Cortex Slides", lecturer: "Dr. Kwesi Ampofo", date: "2025-09-25", uploadedBy: "KB4GESA Admin", downloads: 360, fileName: "COE381_ARM.pdf", size: "3.9 MB" },
    { id: "m30", courseId: "coe-451", type: "notes", topic: "Design Patterns", title: "GoF Patterns for Software Engineers", lecturer: "Dr. Ernest Oppong", date: "2025-10-30", uploadedBy: "Patrick Mensah", downloads: 470, fileName: "COE451_Patterns.pdf", size: "2.3 MB" },
    { id: "m31", courseId: "coe-272", type: "slides", topic: "Sequential Logic", title: "Flip-Flops, Registers & Counters", lecturer: "Ing. Patrick Mensah", date: "2025-09-14", uploadedBy: "KB4GESA Admin", downloads: 520, fileName: "COE272_Sequential.pdf", size: "2.5 MB" },
    { id: "m32", courseId: "coe-101", type: "past-questions", topic: "End of Semester", title: "COE 101 Past Questions Bundle", lecturer: "Ms. Felicia Boateng", date: "2025-12-10", uploadedBy: "Korle Boye Archive", downloads: 1900, fileName: "COE101_PQ.pdf", size: "1.6 MB" },

    // EE
    { id: "m33", courseId: "ee-301", type: "slides", topic: "Power Transmission", title: "Transmission Line Parameters", lecturer: "Prof. Joseph Appiah", date: "2025-09-11", uploadedBy: "KB4GESA Admin", downloads: 290, fileName: "EE301_Transmission.pdf", size: "3.0 MB" },
    { id: "m34", courseId: "ee-301", type: "past-questions", topic: "End of Semester", title: "EE 301 Past Papers 2021–2025", lecturer: "Prof. Joseph Appiah", date: "2026-01-05", uploadedBy: "Rita Nkrumah", downloads: 610, fileName: "EE301_PQ.pdf", size: "2.4 MB" },
    { id: "m35", courseId: "ee-351", type: "notes", topic: "Root Locus", title: "Root Locus Construction Notes", lecturer: "Dr. Rita Nkrumah", date: "2025-10-28", uploadedBy: "Francis Osei", downloads: 240, fileName: "EE351_RootLocus.pdf", size: "1.3 MB" },
    { id: "m36", courseId: "ee-201", type: "slides", topic: "AC Circuits", title: "Phasors & Complex Impedance", lecturer: "Ing. Francis Osei", date: "2025-09-07", uploadedBy: "KB4GESA Admin", downloads: 450, fileName: "EE201_AC.pdf", size: "2.1 MB" },

    // CHE
    { id: "m37", courseId: "che-301", type: "slides", topic: "Reactor Design", title: "CSTR & PFR Design Equations", lecturer: "Prof. Grace Antwi", date: "2025-09-16", uploadedBy: "KB4GESA Admin", downloads: 180, fileName: "CHE301_Reactors.pdf", size: "2.8 MB" },
    { id: "m38", courseId: "che-251", type: "notes", topic: "Heat Transfer", title: "Conduction & Convection Notes", lecturer: "Dr. Felix Ankomah", date: "2025-10-12", uploadedBy: "Linda Owusu", downloads: 150, fileName: "CHE251_Heat.pdf", size: "1.5 MB" },

    // IE
    { id: "m39", courseId: "ie-301", type: "slides", topic: "Linear Programming", title: "LP Formulation & Simplex Method", lecturer: "Dr. Charles Agyei", date: "2025-09-19", uploadedBy: "KB4GESA Admin", downloads: 260, fileName: "IE301_LP.pdf", size: "2.2 MB" },
    { id: "m40", courseId: "ie-351", type: "past-questions", topic: "End of Semester", title: "IE 351 Quality Control Past Papers", lecturer: "Ms. Joyce Mensah", date: "2026-02-08", uploadedBy: "Robert Owusu", downloads: 200, fileName: "IE351_PQ.pdf", size: "1.4 MB" },
    { id: "m41", courseId: "ie-401", type: "notes", topic: "MRP Systems", title: "Material Requirements Planning Notes", lecturer: "Ing. Robert Owusu", date: "2026-01-18", uploadedBy: "Victor Addae", downloads: 130, fileName: "IE401_MRP.pdf", size: "980 KB" },

    // Recently added (newer dates)
    { id: "m42", courseId: "ce-405", type: "shared", topic: "Pavement Design Example", title: "Worked Example — Flexible Pavement", lecturer: "Ing. Yaw Boateng", date: "2026-09-20", uploadedBy: "Korle Boye Study Group", downloads: 42, fileName: "CE405_Pavement_Example.pdf", size: "720 KB" },
    { id: "m43", courseId: "me-401", type: "slides", topic: "Gear Design", title: "Spur & Helical Gear Design Slides", lecturer: "Ing. Gloria Tetteh", date: "2026-09-18", uploadedBy: "KB4GESA Admin", downloads: 88, fileName: "ME401_Gears.pdf", size: "3.6 MB" },
    { id: "m44", courseId: "coe-457", type: "shared", topic: "A* Search Lab", title: "Student Lab Report — A* Pathfinding", lecturer: "Prof. Abena Gyasi", date: "2026-09-22", uploadedBy: "COE Study Circle", downloads: 65, fileName: "COE457_AStar_Lab.pdf", size: "1.1 MB" },
    { id: "m45", courseId: "ee-401", type: "notes", topic: "Synchronous Generators", title: "Sync Machine Performance Notes", lecturer: "Prof. Daniel Adjei", date: "2026-09-15", uploadedBy: "Joseph Appiah", downloads: 55, fileName: "EE401_Sync.pdf", size: "1.9 MB" },
    { id: "m46", courseId: "ce-151", type: "slides", topic: "Isometric Projection", title: "Engineering Drawing — Isometrics", lecturer: "Ing. Patricia Amoah", date: "2026-09-10", uploadedBy: "KB4GESA Admin", downloads: 320, fileName: "CE151_Isometric.pdf", size: "4.8 MB" },
  ],
};

/* ---------- Helper accessors ---------- */
EBB.getDepartment = (id) => EBB.departments.find((d) => d.id === id);
EBB.getCourse = (id) => EBB.courses.find((c) => c.id === id);
EBB.getCourseByCode = (code) =>
  EBB.courses.find((c) => c.code.toLowerCase() === code.toLowerCase().trim());
EBB.getMaterialsForCourse = (courseId) =>
  EBB.materials.filter((m) => m.courseId === courseId);
EBB.getTypeMeta = (typeId) => EBB.materialTypes.find((t) => t.id === typeId);

EBB.coursesForDepartment = (deptId) =>
  EBB.courses.filter((c) => c.department === deptId);

EBB.coursesForDeptLevel = (deptId, levelId) =>
  EBB.courses.filter((c) => c.department === deptId && c.level === levelId);

EBB.actualMaterialCount = (deptId) => {
  const courseIds = new Set(
    EBB.courses.filter((c) => c.department === deptId).map((c) => c.id)
  );
  return EBB.materials.filter((m) => courseIds.has(m.courseId)).length;
};

EBB.search = (query) => {
  const q = (query || "").toLowerCase().trim();
  if (!q) return [];

  const courseHits = EBB.courses.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.lecturer.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
  );

  const materialHits = EBB.materials.filter((m) => {
    const course = EBB.getCourse(m.courseId);
    const typeMeta = EBB.getTypeMeta(m.type);
    return (
      m.topic.toLowerCase().includes(q) ||
      m.title.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      (typeMeta && typeMeta.name.toLowerCase().includes(q)) ||
      (course &&
        (course.code.toLowerCase().includes(q) ||
          course.name.toLowerCase().includes(q))) ||
      m.lecturer.toLowerCase().includes(q) ||
      m.uploadedBy.toLowerCase().includes(q)
    );
  });

  return { courses: courseHits, materials: materialHits, query: q };
};

EBB.recentMaterials = (n = 6) =>
  [...EBB.materials]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, n);

EBB.mostAccessedCourses = (n = 6) =>
  [...EBB.courses].sort((a, b) => b.accessCount - a.accessCount).slice(0, n);

EBB.filterMaterials = ({ type, department, level, query } = {}) => {
  let list = [...EBB.materials];
  if (type) list = list.filter((m) => m.type === type);
  if (department || level) {
    list = list.filter((m) => {
      const c = EBB.getCourse(m.courseId);
      if (!c) return false;
      if (department && c.department !== department) return false;
      if (level && c.level !== level) return false;
      return true;
    });
  }
  if (query) {
    const q = query.toLowerCase().trim();
    list = list.filter((m) => {
      const c = EBB.getCourse(m.courseId);
      return (
        m.topic.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.type.includes(q) ||
        (c &&
          (c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q)))
      );
    });
  }
  return list;
};

// Expose globally
window.EBB = EBB;
