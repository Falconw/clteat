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
    "Start a Consultation": "ابدأ استشارة",
    "Start a Consultation →": "ابدأ استشارة ←",
    "Explore Our Services": "استكشف خدماتنا",
    "Explore Services": "استكشف الخدمات",
    "More about TechSys": "المزيد عن تك سيس",
    "How we work": "كيف نعمل",
    "Company": "الشركة",
    "Email": "البريد الإلكتروني",
    "Phone": "الهاتف",
    "Office": "المكتب",
    "Riyadh, Kingdom of": "الرياض، المملكة",
    "Saudi Arabia": "العربية السعودية",
    "Riyadh, Kingdom of Saudi Arabia": "الرياض، المملكة العربية السعودية",
    "Engineered Clarity · Riyadh, KSA": "وضوحٌ هندسي · الرياض، السعودية",
    "Where Dreams Are Born · Saudi Arabia & Middle East": "حيث تُولد الأحلام · السعودية والشرق الأوسط",
    "Engineered Clarity. We design, build and integrate enterprise technology — the systems that keep organisations running.": "وضوحٌ هندسي. نصمّم ونبني ونُكامل تقنية المؤسسات — الأنظمة التي تُبقي المؤسسات تعمل.",

    /* Breadcrumb trailing segments */
    "/ About": "/ من نحن",
    "/ Services": "/ الخدمات",
    "/ Clients": "/ العملاء",
    "/ Contact": "/ تواصل معنا",

    /* Service names */
    "Digital Transformation": "التحول الرقمي",
    "ERP & IT Solutions": "حلول تخطيط الموارد وتقنية المعلومات",
    "IT Consultations": "الاستشارات التقنية",
    "IT Support": "الدعم التقني",
    "Web & App Development": "تطوير المواقع والتطبيقات",
    "IT Procurement": "توريد تقنية المعلومات",

    /* HOME — hero */
    "Empowering organizations with tailored technology and trusted partnerships for": "نُمكّن المؤسسات عبر حلول تقنية مصمّمة بعناية وشراكات موثوقة، لقيادة",
    "seamless transformation.": "تحوّل سلس ومستدام.",
    "TechSys partners with organizations to design, build, and support tailored technology ecosystems that strengthen operations, enable progress, and deliver long-term value.": "تتشارك تك سيس مع المؤسسات لتصميم وبناء ودعم منظومات تقنية مصمّمة بعناية تُعزّز العمليات، وتُمكّن التقدّم، وتُحقّق قيمة طويلة الأمد.",
    "Saudi-based, enterprise-ready": "مقرّها السعودية، وجاهزة للمؤسسات",
    "Core practices": "ممارسات أساسية",
    "Analyze → Architect → Deploy → Sustain": "تحليل ← هندسة ← تنفيذ ← استدامة",
    "Scroll": "مرِّر",

    /* HOME — message */
    "01 — Who we are": "01 — من نحن",
    "Technology should fit the business — not the other way around.": "ينبغي أن تتكيّف التقنية مع العمل — لا العكس.",
    "TechSys is a Saudi-based technology partner for organisations that depend on their systems. We work with enterprises, institutions and growing businesses to plan, build and run technology that is reliable, well-structured and genuinely aligned with how they operate.": "تك سيس شريك تقني مقرّه السعودية للمؤسسات التي تعتمد على أنظمتها. نعمل مع الشركات الكبرى والمؤسسات والأعمال النامية لتخطيط وبناء وتشغيل تقنية موثوقة وجيّدة البنية ومتوائمة فعلياً مع طريقة عملها.",
    "We don't sell technology for its own sake. We understand the operation first, then design systems that fit it — practical, scalable and built to last. The result is clarity: infrastructure and platforms your teams can trust, and that grow with you.": "نحن لا نبيع التقنية لذاتها. نفهم العملية أولاً، ثم نصمّم أنظمة تناسبها — عملية وقابلة للتوسّع ومبنية لتدوم. والنتيجة وضوح: بنية تحتية ومنصّات تثق بها فرقك وتنمو معك.",
    "Business-aligned": "متوائمة مع العمل",
    "Every system maps to a real operational need — measured by the outcome it delivers, not the tooling it uses.": "كل نظام يرتبط بحاجة تشغيلية حقيقية — يُقاس بالنتيجة التي يحقّقها، لا بالأدوات التي يستخدمها.",
    "Built to last": "مبنية لتدوم",
    "Clean architecture, documented decisions and maintainable systems that stay dependable long after launch.": "بنية معمارية نظيفة وقرارات موثّقة وأنظمة قابلة للصيانة تبقى موثوقة طويلاً بعد الإطلاق.",
    "Clear by design": "واضحة بالتصميم",
    "We make complex infrastructure simple to operate, with one source of truth and no hidden complexity.": "نجعل البنية التحتية المعقّدة سهلة التشغيل، بمصدرٍ واحد للحقيقة ودون تعقيد خفيّ.",
    "Accountable": "مسؤولون",
    "We plan, implement and support — staying responsible for reliability across the full lifecycle of your systems.": "نخطّط وننفّذ وندعم — ونبقى مسؤولين عن الموثوقية عبر دورة حياة أنظمتك كاملة.",

    /* HOME — services */
    "02 — What we do": "02 — ماذا نقدّم",
    "Six practices. One dependable system.": "ست ممارسات. نظام واحد موثوق.",
    "From strategy and infrastructure to development and day-to-day support, TechSys covers the full technology lifecycle — so the pieces are engineered to work together.": "من الاستراتيجية والبنية التحتية إلى التطوير والدعم اليومي، تغطّي تك سيس دورة حياة التقنية كاملة — لتُهندَس الأجزاء كي تعمل معاً.",
    "We modernise processes, workflows and systems through practical technology adoption — not disruption for its own sake.": "نُحدّث العمليات ومسارات العمل والأنظمة عبر تبنٍّ عمليّ للتقنية — لا اضطراباً لأجل الاضطراب.",
    "Faster, leaner operations": "عمليات أسرع وأكثر رشاقة",
    "Planning, implementation support, integration and customization coordination that keeps your core systems aligned.": "تخطيط ودعم تنفيذ وتكامل وتنسيق تخصيص يُبقي أنظمتك الأساسية متوائمة.",
    "Connected operations": "عمليات مترابطة",
    "Advisory for technology decisions, infrastructure planning, vendor evaluation, security posture and digital strategy.": "استشارات لقرارات التقنية وتخطيط البنية التحتية وتقييم المورّدين والوضع الأمني والاستراتيجية الرقمية.",
    "Confident decisions": "قرارات واثقة",
    "Reliable managed support, troubleshooting, administration and user support that keeps operations continuous.": "دعم مُدار موثوق واستكشاف للأعطال وإدارة ودعم للمستخدمين يُبقي العمليات مستمرّة.",
    "Operational continuity": "استمرارية التشغيل",
    "Websites, portals, internal tools and mobile applications — custom platforms built around real business needs.": "مواقع وبوابات وأدوات داخلية وتطبيقات جوال — منصّات مخصّصة مبنية حول احتياجات العمل الحقيقية.",
    "Purpose-built platforms": "منصّات مبنية لغرضها",
    "Sourcing the right hardware, software, licenses and infrastructure with technical evaluation and practical advice.": "توريد الأجهزة والبرمجيات والتراخيص والبنية التحتية المناسبة مع تقييم تقني ونصيحة عملية.",
    "Right tools, right price": "الأدوات المناسبة بالسعر المناسب",
    "See all services in detail": "اطّلع على كل الخدمات بالتفصيل",

    /* HOME — approach */
    "03 — How we think": "03 — كيف نفكّر",
    "We understand before we build.": "نفهم قبل أن نبني.",
    "Understand the operation": "نفهم العملية",
    "Design the right system": "نصمّم النظام الصحيح",
    "Build, run & support": "نبني ونشغّل وندعم",

    /* HOME — clients teaser */
    "04 — Trusted by": "04 — موضع ثقة",
    "Organisations that depend on their systems.": "مؤسسات تعتمد على أنظمتها.",
    "We partner with enterprises and institutions across sectors. Logos shown are placeholders — ready to be replaced with your client marks.": "نتشارك مع الشركات الكبرى والمؤسسات عبر القطاعات. الشعارات المعروضة مؤقتة — جاهزة لاستبدالها بعلامات عملائك.",
    "See clients & project scopes": "اطّلع على العملاء ونطاقات المشاريع",

    /* HOME — CTA */
    "Let's begin": "لنبدأ",
    "Ready to make your technology clear?": "جاهز لجعل تقنيتك واضحة؟",
    "Tell us where your systems are today. We'll help you map a practical path to where they need to be — with no obligation.": "أخبرنا أين تقف أنظمتك اليوم. سنساعدك على رسم مسار عملي إلى حيث ينبغي أن تكون — دون أي التزام.",

    /* Sector tags */
    "Enterprise · Infrastructure": "مؤسسات · بنية تحتية",
    "Public sector · ERP": "القطاع العام · تخطيط الموارد",
    "Finance · Managed IT": "تمويل · تقنية مُدارة",
    "Healthcare · Support": "رعاية صحية · دعم",
    "Retail · Platforms": "تجزئة · منصّات",
    "Education · Consulting": "تعليم · استشارات",

    /* ABOUT */
    "A technology partner with discipline, taste and judgment.": "شريك تقني يتمتّع بالانضباط والذوق وحُسن التقدير.",
    "We're not here to add more tools. We're here to make your technology coherent — systems that fit your operation, hold up under real use, and stay clear as you grow.": "لسنا هنا لإضافة المزيد من الأدوات. نحن هنا لجعل تقنيتك متماسكة — أنظمة تناسب عمليّتك، وتصمد تحت الاستخدام الحقيقي، وتبقى واضحة مع نموّك.",
    "TechSys exists to make enterprise technology clear.": "وُجدت تك سيس لجعل تقنية المؤسسات واضحة.",
    "Based in Riyadh, TechSys is a premium IT solutions company serving enterprises, institutions and growing businesses across the Kingdom and beyond. We combine technical execution with business judgment across the full technology lifecycle — strategy, infrastructure, development, support and procurement.": "مقرّها الرياض، تك سيس شركة حلول تقنية معلومات متميّزة تخدم الشركات الكبرى والمؤسسات والأعمال النامية في المملكة وخارجها. نجمع بين التنفيذ التقني وحُسن التقدير في العمل عبر دورة حياة التقنية كاملة — استراتيجية وبنية تحتية وتطوير ودعم وتوريد.",
    "Organisations come to us when their systems matter too much to leave to chance. We bring structure where there's complexity, and a single, dependable point of accountability for technology that has to work.": "تأتينا المؤسسات حين تكون أنظمتها أهمّ من أن تُترك للصدفة. نأتي بالبنية حيث يوجد التعقيد، وبنقطة مسؤولية واحدة موثوقة لتقنية يجب أن تعمل.",
    "Business-aligned delivery": "تسليم متوائم مع العمل",
    "Point of accountability": "نقطة مسؤولية",
    "02 — What we believe": "02 — بماذا نؤمن",
    "Technology should fit the business. Not the other way around.": "ينبغي أن تتكيّف التقنية مع العمل. لا العكس.",
    "Too many systems are bought, then bent to. We start from the operation and design technology around it — practical, scalable and well-structured. That conviction shapes every engagement.": "تُشترى أنظمة كثيرة ثم يُجبَر العمل على التكيّف معها. نحن نبدأ من العملية ونصمّم التقنية حولها — عملية وقابلة للتوسّع وجيّدة البنية. هذه القناعة تُشكّل كل ارتباط لنا.",
    "Clarity over complexity": "الوضوح قبل التعقيد",
    "We make complex infrastructure simple to operate — one source of truth, nothing arbitrary, no hidden moving parts.": "نجعل البنية التحتية المعقّدة سهلة التشغيل — مصدر واحد للحقيقة، لا شيء اعتباطي، ولا أجزاء خفيّة متحرّكة.",
    "Reliability is the feature": "الموثوقية هي الميزة",
    "A system that isn't dependable isn't finished. We design for uptime, maintainability and the long term.": "النظام غير الموثوق نظام غير مكتمل. نصمّم من أجل التوافر وقابلية الصيانة والأمد الطويل.",
    "Judgment, not just execution": "تقديرٌ، لا مجرّد تنفيذ",
    "We pair technical skill with business sense, so the right thing gets built — not just the thing that was asked for.": "نقرن المهارة التقنية بالحسّ التجاري، فيُبنى الشيء الصحيح — لا مجرّد ما طُلب.",
    "Honest counsel": "نصيحة صادقة",
    "We recommend what the operation needs, including when that means doing less. Trust is the long game.": "نوصي بما تحتاجه العملية، حتى حين يعني ذلك فعل أقل. الثقة هي اللعبة الطويلة.",
    "03 — Our mission": "03 — مهمّتنا",
    "To deliver practical, scalable, well-structured technology — and to stay accountable for it long after launch.": "أن نقدّم تقنية عملية وقابلة للتوسّع وجيّدة البنية — وأن نبقى مسؤولين عنها طويلاً بعد الإطلاق.",
    "04 — Our approach": "04 — منهجنا",
    "How we think about a system.": "كيف نفكّر في أيّ نظام.",
    "A deliberate sequence. We don't skip to tools — we earn the right to recommend them.": "تسلسل مدروس. لا نقفز إلى الأدوات — بل نكتسب حقّ التوصية بها.",
    "STEP 01": "الخطوة 01",
    "STEP 02": "الخطوة 02",
    "STEP 03": "الخطوة 03",
    "STEP 04": "الخطوة 04",
    "Understand": "نفهم",
    "We learn the operation — its workflows, constraints and goals — before proposing anything. The brief is rarely the whole story.": "نتعلّم العملية — مساراتها وقيودها وأهدافها — قبل اقتراح أيّ شيء. نادراً ما يكون الموجز هو القصة كاملة.",
    "We architect a solution that maps to real needs: clear structure, sensible integration, room to scale, no over-engineering.": "نهندس حلاً يرتبط بالاحتياجات الحقيقية: بنية واضحة وتكامل منطقي ومساحة للنمو، دون هندسة مفرطة.",
    "Build & integrate": "نبني ونُكامل",
    "We implement with precision and document as we go, so the system is maintainable by your team and by us.": "ننفّذ بدقّة ونوثّق أثناء العمل، ليبقى النظام قابلاً للصيانة من فريقك ومنّا.",
    "Run & support": "نشغّل وندعم",
    "We stay responsible for reliability — support, administration and continuous improvement across the lifecycle.": "نبقى مسؤولين عن الموثوقية — دعم وإدارة وتحسين مستمرّ عبر دورة الحياة.",
    "05 — Why businesses choose TechSys": "05 — لماذا تختار الشركات تك سيس",
    "Serious technology, handled seriously.": "تقنية جادّة، تُدار بجدّية.",
    "Full-lifecycle partner": "شريك لدورة الحياة الكاملة",
    "Strategy, build, run and support under one roof — no fragmented vendors, no finger-pointing.": "استراتيجية وبناء وتشغيل ودعم تحت سقف واحد — لا مورّدين متفرّقين، ولا تبادل للّوم.",
    "Business-first thinking": "تفكيرٌ يضع العمل أولاً",
    "We translate operational goals into technical decisions, and back again, in language both sides understand.": "نترجم الأهداف التشغيلية إلى قرارات تقنية، والعكس، بلغة يفهمها الطرفان.",
    "Maintainable by design": "قابلة للصيانة بالتصميم",
    "Documented architecture and clean implementation mean lower long-term cost and fewer surprises.": "بنية موثّقة وتنفيذ نظيف يعنيان تكلفة أقل على المدى الطويل ومفاجآت أقل.",
    "Local, enterprise-ready": "محلّية وجاهزة للمؤسسات",
    "Saudi-based and responsive, with the rigour and discretion enterprise clients expect.": "مقرّها السعودية وسريعة الاستجابة، بالدقّة والكتمان اللذين تتوقّعهما المؤسسات.",
    "Vendor-neutral advice": "نصيحة محايدة تجاه المورّدين",
    "We recommend what fits — not what we're incentivised to sell. Procurement guided by technical merit.": "نوصي بما يناسب — لا بما لنا مصلحة في بيعه. توريد تقوده الجدارة التقنية.",
    "Precision & restraint": "دقّة وانضباط",
    "Deliberate spacing, alignment and decisions. Nothing arbitrary — clarity you can see in the work.": "تباعد ومحاذاة وقرارات مدروسة. لا شيء اعتباطي — وضوح تراه في العمل.",
    "Work with us": "اعمل معنا",
    "Let's build something dependable.": "لنبنِ شيئاً موثوقاً.",
    "Start with a conversation. We'll understand your operation first — then tell you, honestly, how we can help.": "ابدأ بمحادثة. سنفهم عمليّتك أولاً — ثم نخبرك بصدق كيف يمكننا المساعدة.",

    /* SERVICES */
    "Six practices across the full technology lifecycle.": "ست ممارسات عبر دورة حياة التقنية كاملة.",
    "Strategy, infrastructure, development, support and procurement — engineered to work together, so nothing falls between the cracks.": "استراتيجية وبنية تحتية وتطوير ودعم وتوريد — مُهندَسة لتعمل معاً، فلا يضيع شيء بين الثغرات.",
    "01 — Service": "01 — خدمة",
    "02 — Service": "02 — خدمة",
    "03 — Service": "03 — خدمة",
    "04 — Service": "04 — خدمة",
    "05 — Service": "05 — خدمة",
    "06 — Service": "06 — خدمة",
    "How TechSys helps": "كيف تساعد تك سيس",
    "We help organisations modernise processes, systems and workflows through practical technology adoption — change that sticks because it fits how people actually work.": "نساعد المؤسسات على تحديث العمليات والأنظمة ومسارات العمل عبر تبنٍّ عمليّ للتقنية — تغيير يدوم لأنه يناسب طريقة عمل الناس فعلاً.",
    "Transformation fails when it's driven by tools instead of outcomes. We start with your operation, identify where technology removes friction, and sequence change so the business keeps running throughout.": "يفشل التحول حين تقوده الأدوات بدل النتائج. نبدأ من عمليّتك، ونحدّد أين تزيل التقنية الاحتكاك، ونرتّب التغيير كي يستمرّ العمل طوال الوقت.",
    "Process and workflow assessment with clear modernisation roadmaps": "تقييم العمليات ومسارات العمل مع خرائط طريق واضحة للتحديث",
    "System consolidation and digitisation of manual operations": "توحيد الأنظمة ورقمنة العمليات اليدوية",
    "Phased rollout with adoption support and change management": "إطلاق تدريجي مع دعم التبنّي وإدارة التغيير",
    "Roadmap": "خارطة طريق",
    "Process redesign": "إعادة تصميم العمليات",
    "Adoption plan": "خطة تبنٍّ",
    "Business value — faster, leaner, measurable operations": "القيمة للعمل — عمليات أسرع وأرشق وقابلة للقياس",
    "We bring structure to ERP and core IT systems — planning, implementation support, integration and customization coordination that keeps everything aligned.": "نأتي بالبنية إلى أنظمة تخطيط الموارد وتقنية المعلومات الأساسية — تخطيط ودعم تنفيذ وتكامل وتنسيق تخصيص يُبقي كل شيء متوائماً.",
    "ERP touches every department, so the risk is in the seams. We coordinate scope, data and integrations across stakeholders and vendors, keeping the implementation honest and the system aligned to your operating model.": "يمسّ تخطيط الموارد كل قسم، فالمخاطرة تكمن في المفاصل. ننسّق النطاق والبيانات والتكاملات عبر أصحاب المصلحة والمورّدين، مع إبقاء التنفيذ نزيهاً والنظام متوائماً مع نموذج تشغيلك.",
    "Requirements, scoping and implementation planning": "المتطلبات وتحديد النطاق وتخطيط التنفيذ",
    "Integration between ERP, line-of-business and legacy systems": "التكامل بين تخطيط الموارد وأنظمة الأعمال والأنظمة القديمة",
    "Customization coordination and operational alignment": "تنسيق التخصيص والمواءمة التشغيلية",
    "Implementation plan": "خطة تنفيذ",
    "Integration map": "خريطة تكامل",
    "Data alignment": "مواءمة البيانات",
    "Business value — connected operations, one source of truth": "القيمة للعمل — عمليات مترابطة ومصدر واحد للحقيقة",
    "Clear, vendor-neutral advisory for the decisions that are expensive to get wrong — infrastructure, strategy, security and system improvement.": "استشارات واضحة ومحايدة تجاه المورّدين للقرارات التي يكلّف الخطأ فيها كثيراً — البنية التحتية والاستراتيجية والأمن وتحسين الأنظمة.",
    "Good advice pays for itself. We assess where you are, weigh the options on technical merit, and give you a defensible recommendation — in language your leadership and your engineers both trust.": "النصيحة الجيّدة تردّ تكلفتها. نقيّم أين أنت، ونزن الخيارات على أساس الجدارة التقنية، ونمنحك توصية قابلة للدفاع — بلغة يثق بها قادتك ومهندسوك معاً.",
    "Infrastructure planning and technology decision support": "تخطيط البنية التحتية ودعم قرارات التقنية",
    "Vendor evaluation, digital strategy and security posture review": "تقييم المورّدين والاستراتيجية الرقمية ومراجعة الوضع الأمني",
    "System assessments with prioritised improvement plans": "تقييمات للأنظمة مع خطط تحسين مرتّبة بالأولوية",
    "Assessment": "تقييم",
    "Recommendation": "توصية",
    "Business value — confident, defensible decisions": "القيمة للعمل — قرارات واثقة وقابلة للدفاع",
    "Reliable technical support and managed services that keep your operation continuous — troubleshooting, administration and user support you can count on.": "دعم تقني موثوق وخدمات مُدارة تُبقي عمليّتك مستمرّة — استكشاف للأعطال وإدارة ودعم للمستخدمين يمكنك الاعتماد عليه.",
    "Downtime is a business cost, not just an IT issue. We provide responsive, structured support with clear ownership — so problems are resolved quickly and don't recur.": "التوقّف تكلفة على العمل، لا مجرّد مسألة تقنية. نقدّم دعماً سريع الاستجابة ومنظّماً بملكية واضحة — فتُحلّ المشكلات بسرعة ولا تتكرّر.",
    "Managed support, troubleshooting and incident resolution": "دعم مُدار واستكشاف للأعطال وحلّ للحوادث",
    "System administration, monitoring and maintenance": "إدارة الأنظمة والمراقبة والصيانة",
    "End-user support and operational continuity planning": "دعم المستخدم النهائي وتخطيط استمرارية التشغيل",
    "Managed support": "دعم مُدار",
    "Administration": "إدارة",
    "Monitoring": "مراقبة",
    "Business value — operational continuity, fewer surprises": "القيمة للعمل — استمرارية تشغيل ومفاجآت أقل",
    "We design and build websites, portals, internal tools, web applications and mobile apps — custom platforms aligned to real business needs.": "نصمّم ونبني المواقع والبوابات والأدوات الداخلية وتطبيقات الويب وتطبيقات الجوال — منصّات مخصّصة متوائمة مع احتياجات العمل الحقيقية.",
    "Software should remove work, not create it. We build clean, maintainable platforms with thoughtful UX and solid engineering, scoped to deliver value early and grow deliberately.": "ينبغي للبرمجيات أن تُزيل العمل لا أن تخلقه. نبني منصّات نظيفة وقابلة للصيانة بتجربة استخدام مدروسة وهندسة متينة، مُحدّدة النطاق لتقديم القيمة مبكراً والنمو بتأنٍّ.",
    "Corporate websites, portals and customer-facing platforms": "مواقع الشركات والبوابات والمنصّات الموجّهة للعملاء",
    "Internal tools, web applications and workflow systems": "الأدوات الداخلية وتطبيقات الويب وأنظمة مسارات العمل",
    "Mobile applications and custom integrations": "تطبيقات الجوال والتكاملات المخصّصة",
    "UX & UI": "تجربة وواجهة المستخدم",
    "Web & mobile": "ويب وجوال",
    "Custom platforms": "منصّات مخصّصة",
    "Business value — purpose-built platforms that scale": "القيمة للعمل — منصّات مبنية لغرضها وقابلة للتوسّع",
    "We help you source the right hardware, software, licenses and infrastructure — with technical evaluation and practical recommendations, free of vendor bias.": "نساعدك على توريد الأجهزة والبرمجيات والتراخيص والبنية التحتية المناسبة — بتقييم تقني وتوصيات عملية، دون انحياز لأيّ مورّد.",
    "Buying the wrong equipment is expensive twice. We match procurement to actual technical requirements and total cost of ownership, so every purchase earns its place.": "شراء المعدّات الخاطئة مكلف مرّتين. نوائم التوريد مع المتطلبات التقنية الفعلية والتكلفة الإجمالية للملكية، فيستحقّ كل شراء مكانه.",
    "Requirements-led sourcing of hardware, software and licenses": "توريد قائم على المتطلبات للأجهزة والبرمجيات والتراخيص",
    "Technical evaluation, comparison and total-cost analysis": "تقييم تقني ومقارنة وتحليل للتكلفة الإجمالية",
    "Infrastructure and equipment recommendations": "توصيات للبنية التحتية والمعدّات",
    "Evaluation": "تقييم",
    "Sourcing": "توريد",
    "TCO analysis": "تحليل التكلفة الإجمالية",
    "Business value — the right tools at the right cost": "القيمة للعمل — الأدوات المناسبة بالتكلفة المناسبة",
    "Not sure where to start?": "لست متأكّداً من أين تبدأ؟",
    "Tell us the problem. We'll find the practice.": "أخبرنا بالمشكلة. وسنجد الممارسة المناسبة.",
    "Most engagements begin with a single conversation about what's slowing you down. We'll point you to the right approach — even if it isn't the biggest one.": "تبدأ معظم الارتباطات بمحادثة واحدة حول ما يُبطئك. سنوجّهك إلى المنهج الصحيح — حتى لو لم يكن الأكبر.",

    /* CLIENTS */
    "A selection of engagements across sectors — each paired with a sample project scope. Logos and details shown are placeholders, ready to be replaced with your real client work.": "مجموعة مختارة من الارتباطات عبر القطاعات — كلٌّ مقترن بنموذج لنطاق مشروع. الشعارات والتفاصيل المعروضة مؤقتة، وجاهزة لاستبدالها بأعمال عملائك الحقيقية.",
    "Selected engagements": "ارتباطات مختارة",
    "Client & project scope.": "العميل ونطاق المشروع.",
    "How TechSys shows up in practice — the organisation, the brief, the services involved, and the outcome that mattered.": "كيف تظهر تك سيس عملياً — المؤسسة، والموجز، والخدمات المعنيّة، والنتيجة التي صنعت الفرق.",
    "Project scope": "نطاق المشروع",
    "Multi-site datacenter refresh & network segmentation": "تحديث مراكز بيانات متعدّدة المواقع وتجزئة الشبكة",
    "Consolidated ageing infrastructure across three locations, redesigned the network into segmented zones, and standardised hardware — with a phased cutover that kept operations live throughout.": "وحّدنا بنية تحتية متقادمة عبر ثلاثة مواقع، وأعدنا تصميم الشبكة إلى مناطق مجزّأة، ووحّدنا الأجهزة — بانتقال تدريجي أبقى العمليات حيّة طوال الوقت.",
    "Uptime post-migration": "التوافر بعد الترحيل",
    "ERP implementation support & legacy data migration": "دعم تنفيذ تخطيط الموارد وترحيل البيانات القديمة",
    "Coordinated scope, data and integrations across departments and vendors, migrated records from fragmented legacy systems, and aligned the new ERP to the organisation's real operating model.": "نسّقنا النطاق والبيانات والتكاملات عبر الأقسام والمورّدين، ورحّلنا السجلات من أنظمة قديمة متفرّقة، ووائمنا النظام الجديد مع نموذج التشغيل الحقيقي للمؤسسة.",
    "Systems consolidated": "أنظمة موحّدة",
    "24/7 managed support & security posture hardening": "دعم مُدار على مدار الساعة وتعزيز الوضع الأمني",
    "Established structured managed support with clear ownership, hardened the security posture against assessed risks, and put monitoring in place so issues are caught before they reach users.": "أنشأنا دعماً مُداراً منظّماً بملكية واضحة، وعزّزنا الوضع الأمني ضدّ المخاطر المُقيّمة، ووضعنا مراقبة تُلتقط بها المشكلات قبل أن تصل المستخدمين.",
    "min": "دقيقة",
    "Avg. response time": "متوسّط زمن الاستجابة",
    "Helpdesk & endpoint administration for clinical staff": "مكتب مساعدة وإدارة أجهزة طرفية للكوادر السريرية",
    "Stood up a responsive helpdesk and centralised endpoint administration for a 400-person workforce, keeping clinical and back-office teams working without IT friction.": "أقمنا مكتب مساعدة سريع الاستجابة وإدارة مركزية للأجهزة الطرفية لقوة عاملة من 400 شخص، مع إبقاء الفرق السريرية والإدارية تعمل دون احتكاك تقني.",
    "Users supported": "مستخدمون مدعومون",
    "Customer portal & inventory web application": "بوابة عملاء وتطبيق ويب لإدارة المخزون",
    "Designed and built a customer-facing portal and an internal inventory application on one clean codebase — scoped to deliver value early, then extended deliberately.": "صمّمنا وبنينا بوابة موجّهة للعملاء وتطبيق مخزون داخلي على قاعدة شيفرة واحدة نظيفة — مُحدّدة النطاق لتقديم القيمة مبكراً ثم التوسّع بتأنٍّ.",
    "wks": "أسبوعاً",
    "To first release": "حتى أول إصدار",
    "Digital strategy & vendor evaluation": "استراتيجية رقمية وتقييم مورّدين",
    "Assessed the current technology estate, weighed options on technical merit, and delivered a prioritised digital roadmap with a defensible vendor recommendation leadership could act on.": "قيّمنا المنظومة التقنية الحالية، ووزنّا الخيارات على أساس الجدارة التقنية، وسلّمنا خارطة طريق رقمية مرتّبة بالأولوية مع توصية مورّد قابلة للدفاع يمكن للقيادة التصرّف بناءً عليها.",
    "Clear roadmap delivered": "خارطة طريق واضحة مُسلّمة",
    "Placeholder engagements — replace logos, scopes and results with real client work.": "ارتباطات مؤقتة — استبدل الشعارات والنطاقات والنتائج بأعمال عملاء حقيقية.",
    "Trusted across sectors": "موضع ثقة عبر القطاعات",
    "A partner organisations keep.": "شريك تبقى عليه المؤسسات.",
    "Your project next": "مشروعك التالي",
    "Let's scope what you need.": "لنحدّد نطاق ما تحتاجه.",
    "Tell us the brief and the constraints. We'll come back with a practical scope, a clear approach, and an honest view of what it takes.": "أخبرنا بالموجز والقيود. وسنعود إليك بنطاق عملي، ومنهج واضح، ورؤية صادقة لما يتطلّبه الأمر.",

    /* CONTACT */
    "Let's start with a conversation.": "لنبدأ بمحادثة.",
    "Tell us where your systems are today and what's getting in the way. We'll respond within one business day — no pressure, no obligation.": "أخبرنا أين تقف أنظمتك اليوم وما الذي يعترض الطريق. سنردّ خلال يوم عمل واحد — دون ضغط ودون التزام.",
    "Get in touch": "تواصل معنا",
    "Direct lines to the team.": "خطوط مباشرة مع الفريق.",
    "Prefer to reach out directly? Use the details below, or send the form and we'll route your request to the right practice.": "تفضّل التواصل المباشر؟ استخدم التفاصيل أدناه، أو أرسل النموذج وسنوجّه طلبك إلى الممارسة المناسبة.",
    "Response time": "زمن الاستجابة",
    "Within one business day": "خلال يوم عمل واحد",
    "Map placeholder · Riyadh, KSA": "موضع الخريطة · الرياض، السعودية",
    "Full name": "الاسم الكامل",
    "Service of interest": "الخدمة المهتمّ بها",
    "Select a service…": "اختر خدمة…",
    "Not sure yet / General enquiry": "غير متأكّد بعد / استفسار عام",
    "How can we help?": "كيف يمكننا المساعدة؟",
    "Send Request": "إرسال الطلب",
    "By sending, you agree we may contact you about your enquiry. We never share your details.": "بإرسالك، توافق على أنه يجوز لنا التواصل معك بشأن استفسارك. لا نشارك بياناتك أبداً.",
    "Demo form — connect to your endpoint (e.g. Formspree or an API route) in Phase 2.": "نموذج تجريبي — اربطه بنقطة النهاية الخاصة بك (مثل Formspree أو مسار API) في المرحلة الثانية.",
    "Your name": "اسمك",
    "Your organisation": "اسم مؤسستك",
    "Tell us a little about your systems, goals or the problem you're trying to solve…": "أخبرنا قليلاً عن أنظمتك أو أهدافك أو المشكلة التي تحاول حلّها…",
    "Open menu": "فتح القائمة",

    /* Dynamic (JS) form messages */
    "Thank you — your request has reached TechSys. We'll respond within one business day.": "شكراً لك — وصل طلبك إلى تك سيس. سنردّ خلال يوم عمل واحد.",
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
