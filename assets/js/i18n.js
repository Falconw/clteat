/* ============================================================
   TECHSYS — Bilingual engine (EN ⇄ AR)
   ------------------------------------------------------------
   Translates in place by walking text nodes + key attributes
   against an English→Arabic dictionary, and flips the document
   to RTL. English is the source of truth (works with JS off);
   Arabic is applied on top and remembered in localStorage.
   The wordmark and proper nouns stay Latin by design.
   ============================================================ */
(function () {
  "use strict";

  var STORE = "ts-lang";
  var docEl = document.documentElement;

  /* --- English → Arabic dictionary --------------------------- */
  var DICT = {
    /* Navigation & common */
    "Skip to content": "تخطَّ إلى المحتوى",
    "Home": "الرئيسية",
    "About": "من نحن",
    "Services": "الخدمات",
    "Clients": "العملاء",
    "Contact": "تواصل معنا",
    "Start your journey today →": "ابدأ رحلتك اليوم ←",
    "Explore Our Services": "استكشف خدماتنا",
    "Explore Services": "استكشف الخدمات",
    "More about TechSys": "المزيد عن تيكسيز",
    "How we work": "كيف نعمل",
    "Company": "الشركة",
    "Email": "البريد الإلكتروني",
    "Phone": "الهاتف",
    "Office": "المكتب",
    "Riyadh, Kingdom of": "الرياض، المملكة",
    "Saudi Arabia": "العربية السعودية",
    "Riyadh, Kingdom of Saudi Arabia": "الرياض، المملكة العربية السعودية",
    "Kingdom of Saudi Arabia": "المملكة العربية السعودية",
    "Kingdom of": "المملكة",
    "TechSys office — Spaces at Ajdan Walk, Al Khobar, KSA": "مكتب تيكسيز — سبيسز في أجدان ووك، الخبر، السعودية",
    "Engineered Clarity · Riyadh, KSA": "وضوحٌ هندسي · الرياض، السعودية",
    "Where Dreams Take Shape · Saudi Arabia & Middle East": "حيث تتشكّل الأحلام · السعودية والشرق الأوسط",
    "We partner with organizations to design, build and support the technology that keeps them running.": "نتشارك مع المؤسسات لتصميم وبناء ودعم التقنية التي تُبقيها تعمل.",

    /* Breadcrumb trailing segments */
    "/ About": "/ من نحن",
    "/ Services": "/ الخدمات",
    "/ Clients": "/ العملاء",
    "/ Contact": "/ تواصل معنا",

    /* Service names */
    "Digital Transformation & Enablement": "التحول الرقمي والتمكين",
    "ERP & IT Solutions": "حلول تخطيط الموارد وتقنية المعلومات",
    "IT Consultations": "الاستشارات التقنية",
    "IT Support": "الدعم التقني",
    "Web & App Development": "تطوير المواقع والتطبيقات",
    "IT Procurement": "توريد تقنية المعلومات",
    "Managed IT Services": "الخدمات التقنية المُدارة",
    "IT Support & Consultations": "الدعم والاستشارات التقنية",

    /* HOME — hero */
    "Empowering organizations with tailored technology and trusted partnerships for": "نُمكّن المؤسسات عبر حلول تقنية مصمّمة بعناية وشراكات موثوقة، لقيادة",
    "seamless transformation.": "تحوّل متكامل ومستدام.",
    "TechSys partners with organizations to design, build, and support tailored technology ecosystems that strengthen operations, enable progress, and deliver long-term value.": "تتشارك تيكسيز مع المؤسسات لتصميم وبناء ودعم منظومات تقنية مصمّمة بعناية تُعزّز العمليات، وتُمكّن التقدّم، وتُحقّق قيمة طويلة الأمد.",
    "Saudi-based, enterprise-ready": "مقرّها السعودية، وجاهزة للمؤسسات",
    "Core practices": "ممارسات أساسية",
    "Delivery stages — Analyze → Architect → Deploy → Sustain": "مراحل العمل — تحليل ← هندسة ← تنفيذ ← استدامة",
    "Scroll": "مرِّر",

    /* HOME — message */
    "01 — Who we are": "01 — من نحن",
    "Technology serves a business best when it's built to fit it.": "تخدم التقنية العمل على أفضل نحو حين تُبنى لتناسبه.",
    "TechSys is a Saudi-based technology partner serving organizations where reliable systems are essential. We partner with enterprises, institutions, and growing businesses to design, implement, and manage technology environments built for structure, continuity, and operational alignment.": "تيكسيز شريك تقني مقرّه السعودية يخدم المؤسسات التي تُعدّ فيها الأنظمة الموثوقة أمراً أساسياً. نتشارك مع الشركات الكبرى والمؤسسات والأعمال النامية لتصميم وتنفيذ وإدارة بيئات تقنية مبنية على البنية والاستمرارية والمواءمة التشغيلية.",
    "We start with the business, not the technology. By understanding how an organization works, we design systems that serve its strategy: dependable infrastructure and platforms, engineered to scale as it grows.": "نبدأ من الأعمال، لا من التقنية. وبفهم طريقة عمل المؤسسة، نصمّم أنظمة تخدم استراتيجيتها: بنية تحتية ومنصّات موثوقة مهندَسة للتوسّع مع نموّها.",
    "Analyze": "تحليل",
    "We begin by understanding how your business works, its workflows, constraints and goals, so every decision is grounded in how you actually operate.": "نبدأ بفهم طريقة عمل مؤسستك، مساراتها وقيودها وأهدافها، ليكون كل قرار مبنياً على طريقة عملك الفعلية.",
    "Architect": "هندسة",
    "Then we design a system that fits those needs: clear structure, sensible integration and room to scale, without unnecessary complexity.": "ثم نصمّم نظاماً يناسب تلك الاحتياجات: بنية واضحة وتكامل منطقي ومساحة للتوسّع، دون تعقيد لا داعي له.",
    "Deploy": "تنفيذ",
    "We implement carefully and document as we go, so the system launches smoothly and stays easy to maintain for your team and ours.": "ننفّذ بعناية ونوثّق أثناء العمل، ليُطلق النظام بسلاسة ويبقى سهل الصيانة لفريقك ولنا.",
    "Sustain": "استدامة",
    "After launch, we stay involved, with support, monitoring and ongoing improvements that keep your operations reliable over time.": "بعد الإطلاق، نبقى على تواصل، بالدعم والمراقبة والتحسينات المستمرّة التي تُبقي عملياتك موثوقة مع مرور الوقت.",

    /* HOME — services */
    "02 — What we do": "02 — ماذا نقدّم",
    "Six practices. One dependable system.": "ست ممارسات. نظام واحد موثوق.",
    "From strategy and infrastructure to development and everyday support, we cover the full technology lifecycle, so every piece is built to work together as one system.": "من الاستراتيجية والبنية التحتية إلى التطوير والدعم اليومي، نغطّي دورة حياة التقنية كاملة، فتُبنى كل قطعة لتعمل مع غيرها كنظامٍ واحد.",
    "We modernize your processes, workflows and systems through practical technology adoption, not disruption for its own sake.": "نُحدّث عملياتك ومساراتها وأنظمتك عبر تبنٍّ عمليّ للتقنية، لا اضطراباً لأجل الاضطراب.",
    "Faster, leaner operations": "عمليات أسرع وأكثر رشاقة",
    "Planning, implementation, integration and customization, coordinated so your core systems stay aligned.": "تخطيط وتنفيذ وتكامل وتخصيص، مُنسّقة لتبقى أنظمتك الأساسية متوائمة.",
    "Connected operations": "عمليات مترابطة",
    "Clear, practical advice on technology decisions, infrastructure, vendor evaluation, security and digital strategy.": "نصيحة واضحة وعملية في قرارات التقنية والبنية التحتية وتقييم المورّدين والأمن والاستراتيجية الرقمية.",
    "Confident decisions": "قرارات واثقة",
    "Reliable managed support, troubleshooting and administration that keeps your operations running without interruption.": "دعم مُدار موثوق واستكشاف للأعطال وإدارة يُبقي عملياتك تعمل دون انقطاع.",
    "Operational continuity": "استمرارية التشغيل",
    "Websites, portals, internal tools and mobile apps, custom platforms built around the way your business actually works.": "مواقع وبوابات وأدوات داخلية وتطبيقات جوال، منصّات مخصّصة مبنية حول طريقة عمل مؤسستك فعلاً.",
    "Purpose-built platforms": "منصّات مبنية لغرضها",
    "Sourcing the right hardware, software, licenses and infrastructure, backed by technical evaluation and honest advice.": "توريد الأجهزة والبرمجيات والتراخيص والبنية التحتية المناسبة، مدعوماً بتقييم تقني ونصيحة صادقة.",
    "Right tools, right price": "الأدوات المناسبة بالسعر المناسب",
    "See all services in detail": "اطّلع على كل الخدمات بالتفصيل",
    "We run your IT day to day — proactive monitoring, maintenance and security, so your systems stay healthy and your team stays focused.": "ندير تقنيتك يوماً بيوم — مراقبة استباقية وصيانة وأمن، لتبقى أنظمتك سليمة ويبقى فريقك مركّزاً.",
    "Proactive, always-on IT": "تقنية استباقية لا تتوقف",
    "Responsive support and clear, vendor-neutral advice — troubleshooting and administration plus guidance on the decisions that are costly to get wrong.": "دعم سريع الاستجابة ونصيحة واضحة محايدة تجاه المورّدين — استكشاف للأعطال وإدارة، مع إرشاد في القرارات التي يكلّف الخطأ فيها كثيراً.",
    "Confident, continuous operations": "عمليات واثقة ومستمرّة",

    /* HOME — approach */
    "03 — How we think": "03 — كيف نفكّر",
    "We strategize before we build.": "نضع الاستراتيجية قبل أن نبني.",
    "Analyze the operation": "تحليل العملية",
    "Architect the solution": "هندسة الحل",
    "Deploy and run": "التنفيذ والتشغيل",

    /* HOME — clients teaser */
    "04 — Trusted by": "04 — موضع ثقة",
    "Organisations that depend on their systems.": "مؤسسات تعتمد على أنظمتها.",
    "We partner with enterprises and institutions across sectors. The logos below are placeholders, ready to be swapped for your own client marks.": "نتشارك مع الشركات الكبرى والمؤسسات عبر القطاعات. الشعارات أدناه مؤقتة، وجاهزة لاستبدالها بعلامات عملائك.",
    "See clients & project scopes": "اطّلع على العملاء ونطاقات المشاريع",

    /* HOME — CTA */
    "Let's begin": "لنبدأ",
    "Vision sets the ambition. Technology makes it real.": "الرؤية تحدّد الطموح، والتقنية تحوّله إلى واقع.",
    "Tell us the goal. We'll build the digital strategy, systems, and support to deliver it, and the reliability to sustain it.": "أخبرنا بالهدف، وسنبني الاستراتيجية الرقمية والأنظمة والدعم لتحقيقه، والموثوقية لإدامته.",

    /* Sector tags */
    "Enterprise · Infrastructure": "مؤسسات · بنية تحتية",
    "Public sector · ERP": "القطاع العام · تخطيط الموارد",
    "Finance · Managed IT": "تمويل · تقنية مُدارة",
    "Healthcare · Support": "رعاية صحية · دعم",
    "Retail · Platforms": "تجزئة · منصّات",
    "Education · Consulting": "تعليم · استشارات",

    /* ABOUT */
    "Where technology becomes a strategic advantage.": "حيث تُصبح التقنية ميزة استراتيجية.",
    "Our purpose is not to add more tools, but to make your technology coherent — systems that fit your operation, perform under real-world demands, and remain clear as you grow.": "غايتنا ليست إضافة المزيد من الأدوات، بل جعل تقنيتك متماسكة — أنظمة تناسب عمليّتك، وتؤدّي تحت متطلّبات الواقع، وتبقى واضحة مع نموّك.",
    "TechSys exists to bring clarity to enterprise technology.": "وُجدت تيكسيز لتجلب الوضوح إلى تقنية المؤسسات.",
    "TechSys is a Saudi technology firm built on partnership. We pair creative thinking with a strategic, business-first approach that solves each client's unique challenges and keeps them focused on growing their business. To do that, we support organizations from startups to enterprises through our own tools and expertise, or carefully vetted, approved vendors, for maximum assurance and the confidence to reach their full potential.": "تيكسيز شركة تقنية سعودية قائمة على الشراكة. نجمع بين التفكير الإبداعي ونهج استراتيجي يضع الأعمال أولاً، لنحلّ التحديات الفريدة لكل عميل ونُبقيه مركّزاً على تنمية أعماله. ولتحقيق ذلك، ندعم المؤسسات من الشركات الناشئة إلى الكبرى عبر أدواتنا وخبراتنا الداخلية، أو عبر موردين معتمدين ومنتقين بعناية، لنمنح كل عميل أقصى درجات الاطمئنان والثقة للوصول إلى كامل إمكاناته.",
    "Organisations turn to us when their systems are too important to leave to chance. We bring structure to complexity and offer a single, dependable point of accountability for technology that must perform.": "تلجأ إلينا المؤسسات حين تكون أنظمتها أهمّ من أن تُترك للصدفة. نأتي بالبنية إلى التعقيد، ونوفّر نقطة مسؤولية واحدة موثوقة لتقنية يجب أن تؤدّي عملها.",
    "Business-aligned delivery": "تسليم متوائم مع العمل",
    "Point of accountability": "نقطة مسؤولية",
    "02 — What we believe": "02 — بماذا نؤمن",
    "Technology should adapt to the business — never the reverse.": "ينبغي أن تتكيّف التقنية مع العمل — لا العكس أبداً.",
    "Too many systems are purchased, then accommodated. We begin with the operation and design technology around it — practical, scalable, and well-structured. That conviction shapes every engagement.": "تُشترى أنظمة كثيرة ثم يُتكيَّف معها. نحن نبدأ من العملية ونصمّم التقنية حولها — عملية وقابلة للتوسّع وجيّدة البنية. وهذه القناعة تُشكّل كل ارتباط لنا.",
    "Clarity over complexity": "الوضوح قبل التعقيد",
    "We make complex infrastructure simple to operate — a single source of truth, nothing arbitrary, and no hidden moving parts.": "نجعل البنية التحتية المعقّدة سهلة التشغيل — مصدر واحد للحقيقة، لا شيء اعتباطي، ولا أجزاء خفيّة متحرّكة.",
    "Reliability is the feature": "الموثوقية هي الميزة",
    "A system that is not dependable is not finished. We design for uptime, maintainability, and the long term.": "النظام غير الموثوق نظام غير مكتمل. نصمّم من أجل التوافر وقابلية الصيانة والأمد الطويل.",
    "Judgment, not just execution": "تقديرٌ، لا مجرّد تنفيذ",
    "We pair technical skill with commercial insight, so the right solution is built — not merely the one requested.": "نقرن المهارة التقنية بالبصيرة التجارية، فيُبنى الحلّ الصحيح — لا مجرّد ما طُلب.",
    "Honest counsel": "نصيحة صادقة",
    "We recommend what the operation genuinely needs, even when that means doing less. Trust is the long game.": "نوصي بما تحتاجه العملية حقاً، حتى حين يعني ذلك فعل أقل. فالثقة هي اللعبة الطويلة.",
    "03 — Our mission": "03 — مهمّتنا",
    "To deliver practical, scalable, and well-structured technology — and to remain accountable for it long after launch.": "أن نقدّم تقنية عملية وقابلة للتوسّع وجيّدة البنية — وأن نبقى مسؤولين عنها طويلاً بعد الإطلاق.",
    "04 — Our approach": "04 — منهجنا",
    "How we approach every system.": "كيف نتعامل مع أيّ نظام.",
    "A deliberate sequence. We do not rush to tools — we earn the right to recommend them.": "تسلسل مدروس. لا نتعجّل نحو الأدوات — بل نكتسب حقّ التوصية بها.",
    "STEP 01": "الخطوة 01",
    "STEP 02": "الخطوة 02",
    "STEP 03": "الخطوة 03",
    "STEP 04": "الخطوة 04",
    "Understand": "نفهم",
    "We study the operation — its workflows, constraints, and goals — before proposing anything. The brief is rarely the whole story.": "ندرس العملية — مساراتها وقيودها وأهدافها — قبل اقتراح أيّ شيء. فنادراً ما يكون الموجز هو القصة كاملة.",
    "We architect a solution mapped to real needs: clear structure, sensible integration, and room to scale, without over-engineering.": "نهندس حلاً مرتبطاً بالاحتياجات الحقيقية: بنية واضحة وتكامل منطقي ومساحة للتوسّع، دون هندسة مفرطة.",
    "Build & integrate": "نبني ونُكامل",
    "We implement with precision and document throughout, so the system remains maintainable by your team and ours.": "ننفّذ بدقّة ونوثّق طوال العمل، ليبقى النظام قابلاً للصيانة من فريقك ومنّا.",
    "Run & support": "نشغّل وندعم",
    "We remain responsible for reliability — support, administration, and continuous improvement across the lifecycle.": "نبقى مسؤولين عن الموثوقية — دعم وإدارة وتحسين مستمرّ عبر دورة الحياة.",
    "05 — Why businesses choose TechSys": "05 — لماذا تختار الشركات تيكسيز",
    "Serious technology, handled with rigour.": "تقنية جادّة، تُدار بدقّة وصرامة.",
    "Full-lifecycle partner": "شريك لدورة الحياة الكاملة",
    "Strategy, build, run, and support under one roof — no fragmented vendors and no finger-pointing.": "استراتيجية وبناء وتشغيل ودعم تحت سقف واحد — لا مورّدين متفرّقين ولا تبادل للّوم.",
    "Business-first thinking": "تفكيرٌ يضع العمل أولاً",
    "We translate operational goals into technical decisions — and back again — in language that both sides understand.": "نترجم الأهداف التشغيلية إلى قرارات تقنية — والعكس — بلغة يفهمها الطرفان.",
    "Maintainable by design": "قابلة للصيانة بالتصميم",
    "Documented architecture and clean implementation lower long-term cost and reduce surprises.": "البنية الموثّقة والتنفيذ النظيف يخفضان التكلفة على المدى الطويل ويقلّلان المفاجآت.",
    "Local, enterprise-ready": "محلّية وجاهزة للمؤسسات",
    "Saudi-based and responsive, with the rigour and discretion that enterprise clients expect.": "مقرّها السعودية وسريعة الاستجابة، بالدقّة والكتمان اللذين تتوقّعهما المؤسسات.",
    "Vendor-neutral advice": "نصيحة محايدة تجاه المورّدين",
    "We recommend what fits — not what we are incentivised to sell. Procurement is guided by technical merit.": "نوصي بما يناسب — لا بما لنا مصلحة في بيعه. والتوريد تقوده الجدارة التقنية.",
    "Precision & restraint": "دقّة وانضباط",
    "Deliberate spacing, alignment, and decisions. Nothing arbitrary — clarity you can see in the work.": "تباعد ومحاذاة وقرارات مدروسة. لا شيء اعتباطي — وضوح تراه في العمل.",
    "Partner with us": "تشارك معنا",
    "Let us build something dependable.": "لنبنِ شيئاً موثوقاً.",
    "Begin with a conversation. We will understand your operation first — then tell you, candidly, how we can help.": "ابدأ بمحادثة. سنفهم عمليّتك أولاً — ثم نخبرك بصراحة كيف يمكننا المساعدة.",

    /* SERVICES */
    "Six practices spanning the full technology lifecycle.": "ست ممارسات تمتدّ عبر دورة حياة التقنية كاملة.",
    "Strategy, infrastructure, development, support, and procurement — engineered to work together, so nothing falls between the cracks.": "استراتيجية وبنية تحتية وتطوير ودعم وتوريد — مُهندَسة لتعمل معاً، فلا يضيع شيء بين الثغرات.",
    "01 — Service": "01 — خدمة",
    "02 — Service": "02 — خدمة",
    "03 — Service": "03 — خدمة",
    "04 — Service": "04 — خدمة",
    "05 — Service": "05 — خدمة",
    "06 — Service": "06 — خدمة",
    "How TechSys helps": "كيف تساعد تيكسيز",
    "We help organisations modernise their processes, systems, and workflows through practical technology adoption — change that endures because it fits how people genuinely work.": "نساعد المؤسسات على تحديث عملياتها وأنظمتها ومسارات عملها عبر تبنٍّ عمليّ للتقنية — تغيير يدوم لأنه يناسب طريقة عمل الناس فعلاً.",
    "Transformation fails when it is driven by tools rather than outcomes. We begin with your operation, identify where technology removes friction, and sequence change so the business keeps running throughout.": "يفشل التحول حين تقوده الأدوات بدل النتائج. نبدأ من عمليّتك، ونحدّد أين تُزيل التقنية الاحتكاك، ونرتّب التغيير كي يستمرّ العمل طوال الوقت.",
    "Process and workflow assessment with a clear modernisation roadmap": "تقييم العمليات ومسارات العمل مع خارطة طريق واضحة للتحديث",
    "Consolidation of systems and digitisation of manual operations": "توحيد الأنظمة ورقمنة العمليات اليدوية",
    "Phased rollout supported by adoption and change management": "إطلاق تدريجي مدعوم بالتبنّي وإدارة التغيير",
    "Roadmap": "خارطة طريق",
    "Process redesign": "إعادة تصميم العمليات",
    "Adoption plan": "خطة تبنٍّ",
    "Business value — faster, leaner, and measurable operations": "القيمة للعمل — عمليات أسرع وأرشق وقابلة للقياس",
    "We bring structure to ERP and core IT systems — planning, implementation support, integration, and customisation coordination that keep everything aligned.": "نأتي بالبنية إلى أنظمة تخطيط الموارد وتقنية المعلومات الأساسية — تخطيط ودعم تنفيذ وتكامل وتنسيق تخصيص يُبقي كل شيء متوائماً.",
    "ERP touches every department, so the risk lies in the seams. We coordinate scope, data, and integrations across stakeholders and vendors, keeping the implementation honest and the system aligned to your operating model.": "يمسّ تخطيط الموارد كل قسم، فالمخاطرة تكمن في المفاصل. ننسّق النطاق والبيانات والتكاملات عبر أصحاب المصلحة والمورّدين، مع إبقاء التنفيذ نزيهاً والنظام متوائماً مع نموذج تشغيلك.",
    "Requirements gathering, scoping, and implementation planning": "جمع المتطلبات وتحديد النطاق وتخطيط التنفيذ",
    "Integration across ERP, line-of-business, and legacy systems": "التكامل عبر تخطيط الموارد وأنظمة الأعمال والأنظمة القديمة",
    "Customisation coordination and operational alignment": "تنسيق التخصيص والمواءمة التشغيلية",
    "Implementation plan": "خطة تنفيذ",
    "Integration map": "خريطة تكامل",
    "Data alignment": "مواءمة البيانات",
    "Business value — connected operations and one source of truth": "القيمة للعمل — عمليات مترابطة ومصدر واحد للحقيقة",
    "Clear, vendor-neutral advisory for the decisions that are costly to get wrong — infrastructure, strategy, security, and system improvement.": "استشارات واضحة ومحايدة تجاه المورّدين للقرارات التي يكلّف الخطأ فيها كثيراً — البنية التحتية والاستراتيجية والأمن وتحسين الأنظمة.",
    "Sound advice pays for itself. We assess where you stand, weigh the options on technical merit, and deliver a defensible recommendation — in language that your leadership and your engineers both trust.": "النصيحة السديدة تردّ تكلفتها. نقيّم موقعك الحالي، ونزن الخيارات على أساس الجدارة التقنية، ونقدّم توصية قابلة للدفاع — بلغة يثق بها قادتك ومهندسوك معاً.",
    "Infrastructure planning and technology decision guidance": "تخطيط البنية التحتية وإرشاد قرارات التقنية",
    "Vendor evaluation, digital strategy, and security-posture review": "تقييم المورّدين والاستراتيجية الرقمية ومراجعة الوضع الأمني",
    "System assessments with prioritised plans for improvement": "تقييمات للأنظمة مع خطط تحسين مرتّبة بالأولوية",
    "Assessment": "تقييم",
    "Recommendation": "توصية",
    "Business value — confident and defensible decisions": "القيمة للعمل — قرارات واثقة وقابلة للدفاع",
    "Reliable technical support and managed services that keep your operation continuous — troubleshooting, administration, and user support you can depend on.": "دعم تقني موثوق وخدمات مُدارة تُبقي عمليّتك مستمرّة — استكشاف للأعطال وإدارة ودعم للمستخدمين يمكنك الاعتماد عليه.",
    "Downtime is a business cost, not merely an IT issue. We provide responsive, structured support with clear ownership — so problems are resolved quickly and do not recur.": "التوقّف تكلفة على العمل، لا مجرّد مسألة تقنية. نقدّم دعماً سريع الاستجابة ومنظّماً بملكية واضحة — فتُحلّ المشكلات بسرعة ولا تتكرّر.",
    "Managed support, troubleshooting, and incident resolution": "دعم مُدار واستكشاف للأعطال وحلّ للحوادث",
    "System administration, monitoring, and maintenance": "إدارة الأنظمة والمراقبة والصيانة",
    "End-user support and operational-continuity planning": "دعم المستخدم النهائي وتخطيط استمرارية التشغيل",
    "Managed support": "دعم مُدار",
    "Administration": "إدارة",
    "Monitoring": "مراقبة",
    "Business value — operational continuity and fewer surprises": "القيمة للعمل — استمرارية تشغيل ومفاجآت أقل",
    "We design and build websites, portals, internal tools, web applications, and mobile apps — bespoke platforms aligned to real business needs.": "نصمّم ونبني المواقع والبوابات والأدوات الداخلية وتطبيقات الويب وتطبيقات الجوال — منصّات مخصّصة متوائمة مع احتياجات العمل الحقيقية.",
    "Software should remove work, not create it. We build clean, maintainable platforms with considered UX and solid engineering, scoped to deliver value early and grow deliberately.": "ينبغي للبرمجيات أن تُزيل العمل لا أن تخلقه. نبني منصّات نظيفة وقابلة للصيانة بتجربة استخدام مدروسة وهندسة متينة، مُحدّدة النطاق لتقديم القيمة مبكراً والنمو بتأنٍّ.",
    "Corporate websites, portals, and customer-facing platforms": "مواقع الشركات والبوابات والمنصّات الموجّهة للعملاء",
    "Internal tools, web applications, and workflow systems": "الأدوات الداخلية وتطبيقات الويب وأنظمة مسارات العمل",
    "Mobile applications and bespoke integrations": "تطبيقات الجوال والتكاملات المخصّصة",
    "UX & UI": "تجربة وواجهة المستخدم",
    "Web & mobile": "ويب وجوال",
    "Custom platforms": "منصّات مخصّصة",
    "Business value — purpose-built platforms that scale": "القيمة للعمل — منصّات مبنية لغرضها وقابلة للتوسّع",
    "We help you source the right hardware, software, licences, and infrastructure — with technical evaluation and practical recommendations, free of vendor bias.": "نساعدك على توريد الأجهزة والبرمجيات والتراخيص والبنية التحتية المناسبة — بتقييم تقني وتوصيات عملية، دون انحياز لأيّ مورّد.",
    "Procuring the wrong equipment is expensive twice over. We match procurement to actual technical requirements and total cost of ownership, so every purchase earns its place.": "توريد المعدّات الخاطئة مكلف مرّتين. نوائم التوريد مع المتطلبات التقنية الفعلية والتكلفة الإجمالية للملكية، فيستحقّ كل شراء مكانه.",
    "Requirements-led sourcing of hardware, software, and licences": "توريد قائم على المتطلبات للأجهزة والبرمجيات والتراخيص",
    "Technical evaluation, comparison, and total-cost analysis": "تقييم تقني ومقارنة وتحليل للتكلفة الإجمالية",
    "Infrastructure and equipment recommendations": "توصيات للبنية التحتية والمعدّات",
    "Evaluation": "تقييم",
    "Sourcing": "توريد",
    "TCO analysis": "تحليل التكلفة الإجمالية",
    "Business value — the right tools at the right cost": "القيمة للعمل — الأدوات المناسبة بالتكلفة المناسبة",
    "We act as your outsourced IT department — proactively managing infrastructure, endpoints, monitoring and security so technology stays dependable without demanding your attention.": "نعمل كقسم تقنية المعلومات الخاص بك — ندير البنية التحتية والأجهزة الطرفية والمراقبة والأمن بشكل استباقي لتبقى التقنية موثوقة دون أن تستهلك انتباهك.",
    "Reactive fixes keep the lights on; managed services keep them from going out. We take ownership of the everyday — patching, monitoring, backups and security — under clear SLAs and a single point of accountability for your whole estate.": "الإصلاحات التفاعلية تُبقي الأمور تعمل؛ والخدمات المُدارة تمنعها من التعطّل. نتولّى مسؤولية المهام اليومية — التحديثات والمراقبة والنسخ الاحتياطي والأمن — وفق اتفاقيات مستوى خدمة واضحة، ونقطة مسؤولية واحدة لكامل منظومتك.",
    "Proactive monitoring, patching, and preventive maintenance": "مراقبة استباقية وتحديثات وصيانة وقائية",
    "Endpoint, server, and network management under clear SLAs": "إدارة الأجهزة الطرفية والخوادم والشبكات وفق اتفاقيات مستوى خدمة واضحة",
    "Backup, security, and continuity managed as one service": "نسخ احتياطي وأمن واستمرارية تُدار كخدمة واحدة",
    "SLA-backed support": "دعم مدعوم باتفاقية مستوى خدمة",
    "Patch & backup": "تحديثات ونسخ احتياطي",
    "Business value — dependable IT without the overhead of an in-house team": "القيمة للعمل — تقنية موثوقة دون عبء فريق داخلي",
    "Dependable day-to-day support paired with clear, vendor-neutral advisory — so your systems keep running and the big technology decisions are made with confidence.": "دعم يومي موثوق مقترن باستشارات واضحة محايدة تجاه المورّدين — لتبقى أنظمتك تعمل وتُتّخذ القرارات التقنية الكبرى بثقة.",
    "Support and counsel belong together. We resolve the issues that interrupt work and, with the same context, advise on infrastructure, strategy, security and where to improve next — all from a single, accountable partner.": "الدعم والمشورة يكمّل أحدهما الآخر. نحلّ المشكلات التي تعطّل العمل، وبالسياق نفسه نقدّم المشورة في البنية التحتية والاستراتيجية والأمن وأين نُحسّن تالياً — كل ذلك من شريك واحد مسؤول.",
    "Infrastructure planning, vendor evaluation, and digital-strategy guidance": "تخطيط البنية التحتية وتقييم المورّدين وإرشاد الاستراتيجية الرقمية",
    "Security-posture and system assessments with prioritised plans": "تقييم الوضع الأمني والأنظمة مع خطط مرتّبة بالأولوية",
    "Support": "دعم",
    "Advisory": "استشارات",
    "Business value — continuity today, better decisions tomorrow": "القيمة للعمل — استمرارية اليوم، وقرارات أفضل غداً",
    "Unsure where to begin?": "غير متأكّد من أين تبدأ؟",
    "Tell us the problem. We will find the practice.": "أخبرنا بالمشكلة. وسنجد الممارسة المناسبة.",
    "Most engagements begin with a single conversation about what is slowing you down. We will point you to the right approach — even when it is not the largest one.": "تبدأ معظم الارتباطات بمحادثة واحدة حول ما يُبطئك. سنوجّهك إلى المنهج الصحيح — حتى وإن لم يكن الأكبر.",

    /* CLIENTS */
    "A selection of engagements across sectors — each paired with a representative project scope. The logos and details shown are placeholders, ready to be replaced with your own client work.": "مجموعة مختارة من الارتباطات عبر القطاعات — كلٌّ مقترن بنطاق مشروع تمثيلي. الشعارات والتفاصيل المعروضة مؤقتة، وجاهزة لاستبدالها بأعمال عملائك.",
    "Selected engagements": "ارتباطات مختارة",
    "Client & project scope.": "العميل ونطاق المشروع.",
    "How TechSys performs in practice — the organisation, the brief, the services involved, and the outcome that mattered.": "كيف تؤدّي تيكسيز عملها عملياً — المؤسسة، والموجز، والخدمات المعنيّة، والنتيجة التي صنعت الفرق.",
    "Project scope": "نطاق المشروع",
    "Multi-site datacenter refresh & network segmentation": "تحديث مراكز بيانات متعدّدة المواقع وتجزئة الشبكة",
    "We consolidated ageing infrastructure across three sites, redesigned the network into segmented zones, and standardised hardware — with a phased cutover that kept operations live throughout.": "وحّدنا بنية تحتية متقادمة عبر ثلاثة مواقع، وأعدنا تصميم الشبكة إلى مناطق مجزّأة، ووحّدنا الأجهزة — بانتقال تدريجي أبقى العمليات حيّة طوال الوقت.",
    "Uptime post-migration": "التوافر بعد الترحيل",
    "ERP implementation support & legacy data migration": "دعم تنفيذ تخطيط الموارد وترحيل البيانات القديمة",
    "We coordinated scope, data, and integrations across departments and vendors, migrated records from fragmented legacy systems, and aligned the new ERP to the organisation's real operating model.": "نسّقنا النطاق والبيانات والتكاملات عبر الأقسام والمورّدين، ورحّلنا السجلات من أنظمة قديمة متفرّقة، ووائمنا النظام الجديد مع نموذج التشغيل الحقيقي للمؤسسة.",
    "Systems consolidated": "أنظمة موحّدة",
    "24/7 managed support & security posture hardening": "دعم مُدار على مدار الساعة وتعزيز الوضع الأمني",
    "We established structured managed support with clear ownership, hardened the security posture against assessed risks, and introduced monitoring so issues are caught before they reach users.": "أنشأنا دعماً مُداراً منظّماً بملكية واضحة، وعزّزنا الوضع الأمني ضدّ المخاطر المُقيّمة، وأدخلنا مراقبة تُلتقط بها المشكلات قبل أن تصل المستخدمين.",
    "min": "دقيقة",
    "Avg. response time": "متوسّط زمن الاستجابة",
    "Helpdesk & endpoint administration for clinical staff": "مكتب مساعدة وإدارة أجهزة طرفية للكوادر السريرية",
    "We established a responsive helpdesk and centralised endpoint administration for a 400-person workforce, keeping clinical and back-office teams working without IT friction.": "أنشأنا مكتب مساعدة سريع الاستجابة وإدارة مركزية للأجهزة الطرفية لقوة عاملة من 400 شخص، مع إبقاء الفرق السريرية والإدارية تعمل دون احتكاك تقني.",
    "Users supported": "مستخدمون مدعومون",
    "Customer portal & inventory web application": "بوابة عملاء وتطبيق ويب لإدارة المخزون",
    "We designed and built a customer-facing portal and an internal inventory application on a single clean codebase — scoped to deliver value early, then extended deliberately.": "صمّمنا وبنينا بوابة موجّهة للعملاء وتطبيق مخزون داخلي على قاعدة شيفرة واحدة نظيفة — مُحدّدة النطاق لتقديم القيمة مبكراً ثم التوسّع بتأنٍّ.",
    "wks": "أسبوعاً",
    "To first release": "حتى أول إصدار",
    "Digital strategy & vendor evaluation": "استراتيجية رقمية وتقييم مورّدين",
    "We assessed the current technology estate, weighed the options on technical merit, and delivered a prioritised digital roadmap with a defensible vendor recommendation that leadership could act on.": "قيّمنا المنظومة التقنية الحالية، ووزنّا الخيارات على أساس الجدارة التقنية، وسلّمنا خارطة طريق رقمية مرتّبة بالأولوية مع توصية مورّد قابلة للدفاع يمكن للقيادة التصرّف بناءً عليها.",
    "Clear roadmap delivered": "خارطة طريق واضحة مُسلّمة",
    "Placeholder engagements — replace the logos, scopes, and results with real client work.": "ارتباطات مؤقتة — استبدل الشعارات والنطاقات والنتائج بأعمال عملاء حقيقية.",
    "Trusted across sectors": "موضع ثقة عبر القطاعات",
    "A partner organisations keep.": "شريك تبقى عليه المؤسسات.",
    "Your project next": "مشروعك التالي",
    "Let us scope what you need.": "لنحدّد نطاق ما تحتاجه.",
    "Share the brief and the constraints. We will respond with a practical scope, a clear approach, and an honest view of what it takes.": "شاركنا الموجز والقيود. وسنردّ بنطاق عملي، ومنهج واضح، ورؤية صادقة لما يتطلّبه الأمر.",

    /* CONTACT */
    "Let us start with a conversation.": "لنبدأ بمحادثة.",
    "Tell us where your systems stand today and what is getting in the way. We will respond within three business days — no pressure, no obligation.": "أخبرنا أين تقف أنظمتك اليوم وما الذي يعترض الطريق. سنردّ خلال ثلاثة أيام عمل — دون ضغط ودون التزام.",
    "Get in touch": "تواصل معنا",
    "Direct lines to the team.": "خطوط مباشرة مع الفريق.",
    "Prefer to reach out directly? Use the details below, or submit the form and we will route your request to the right practice.": "تفضّل التواصل المباشر؟ استخدم التفاصيل أدناه، أو أرسل النموذج وسنوجّه طلبك إلى الممارسة المناسبة.",
    "Response time": "زمن الاستجابة",
    "Within three business days": "خلال ثلاثة أيام عمل",
    "Map placeholder · Riyadh, KSA": "موضع الخريطة · الرياض، السعودية",
    "Full name": "الاسم الكامل",
    "Service of interest": "الخدمة المهتمّ بها",
    "Select a service…": "اختر خدمة…",
    "Not sure yet — general enquiry": "غير متأكّد بعد — استفسار عام",
    "How can we help?": "كيف يمكننا المساعدة؟",
    "Start your journey today": "ابدأ رحلتك اليوم",
    "Send request": "إرسال الطلب",
    "By submitting, you agree that we may contact you regarding your enquiry. We never share your details.": "بإرسالك، توافق على أنه يجوز لنا التواصل معك بشأن استفسارك. ولا نشارك بياناتك أبداً.",
    "Demo form — connect to your endpoint (e.g. Formspree or an API route) in Phase 2.": "نموذج تجريبي — اربطه بنقطة النهاية الخاصة بك (مثل Formspree أو مسار API) في المرحلة الثانية.",
    "Your name": "اسمك",
    "Your organisation": "اسم مؤسستك",
    "Briefly describe your systems, goals, or the problem you would like to solve…": "صِف باختصار أنظمتك أو أهدافك أو المشكلة التي تودّ حلّها…",
    "Open menu": "فتح القائمة",

    /* Dynamic (JS) form messages */
    "Thank you — your request has reached TechSys. We'll respond within three business days.": "شكراً لك — وصل طلبك إلى تيكسيز. سنردّ خلال ثلاثة أيام عمل.",
    "Please review the highlighted fields and try again.": "يرجى مراجعة الحقول المميّزة والمحاولة مرة أخرى.",
    "Please enter your full name.": "يرجى إدخال اسمك الكامل.",
    "Please enter your company name.": "يرجى إدخال اسم شركتك.",
    "Enter a valid email address.": "أدخل بريداً إلكترونياً صحيحاً.",
    "Enter a valid phone number.": "أدخل رقم هاتف صحيحاً.",
    "Please choose a service.": "يرجى اختيار خدمة.",
    "Tell us a little more (10+ characters).": "أخبرنا أكثر قليلاً (10 أحرف فأكثر).",
    "Sending…": "جارٍ الإرسال…"
  };

  /* --- Engine ------------------------------------------------ */
  function norm(s) { return s.replace(/\s+/g, " ").trim(); }

  var textNodes = [];  // [node, originalValue]
  var attrNodes = [];  // [el, attrName, originalValue]
  var ATTRS = ["placeholder", "aria-label", "title"];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };

  function collect() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !norm(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p || SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest("[data-no-translate]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = walker.nextNode())) textNodes.push([n, n.nodeValue]);

    var els = document.querySelectorAll("[" + ATTRS.join("],[") + "]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest("[data-no-translate]")) continue;
      for (var a = 0; a < ATTRS.length; a++) {
        if (el.hasAttribute(ATTRS[a])) attrNodes.push([el, ATTRS[a], el.getAttribute(ATTRS[a])]);
      }
    }
  }

  function tr(orig) {
    var key = norm(orig);
    return DICT[key] != null ? DICT[key] : null;
  }

  function apply(lang) {
    var ar = lang === "ar";
    for (var i = 0; i < textNodes.length; i++) {
      var node = textNodes[i][0], orig = textNodes[i][1];
      if (ar) {
        var t = tr(orig);
        if (t != null) {
          var lead = (orig.match(/^\s*/) || [""])[0];
          var trail = (orig.match(/\s*$/) || [""])[0];
          node.nodeValue = lead + t + trail;
        } else node.nodeValue = orig;
      } else node.nodeValue = orig;
    }
    for (var j = 0; j < attrNodes.length; j++) {
      var el = attrNodes[j][0], attr = attrNodes[j][1], o = attrNodes[j][2];
      var at = ar ? tr(o) : null;
      el.setAttribute(attr, ar && at != null ? at : o);
    }
    docEl.lang = ar ? "ar" : "en";
    docEl.dir = ar ? "rtl" : "ltr";
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    window.TS_I18N.lang = lang;
    updateToggle(lang);
    docEl.classList.remove("i18n-busy");
  }

  function updateToggle(lang) {
    var btns = document.querySelectorAll("[data-lang-toggle]");
    for (var i = 0; i < btns.length; i++) {
      var label = btns[i].querySelector("[data-lang-label]") || btns[i];
      label.textContent = lang === "ar" ? "EN" : "عربي";
      btns[i].setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    }
  }

  /* Public API for dynamically-created strings (used by main.js) */
  window.TS_I18N = {
    lang: "en",
    t: function (s) { return this.lang === "ar" && DICT[norm(s)] != null ? DICT[norm(s)] : s; }
  };

  function init() {
    collect();
    var saved = "en";
    try { saved = localStorage.getItem(STORE) || "en"; } catch (e) {}
    apply(saved === "ar" ? "ar" : "en");
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("[data-lang-toggle]");
      if (!t) return;
      e.preventDefault();
      apply(window.TS_I18N.lang === "ar" ? "en" : "ar");
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
