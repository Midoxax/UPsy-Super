-- Arabic titles and summaries for the resource library and its topics.
-- Fills only empty fields, so it never overwrites an edit made in the admin.

UPDATE public.resources AS r SET
  title_ar = COALESCE(r.title_ar, v.title_ar),
  summary_ar = COALESCE(r.summary_ar, v.summary_ar)
FROM (VALUES
  ('behavioral-activation', 'قائمة التنشيط السلوكي', 'الاكتئاب يضيّق عالمك. خطوات صغيرة لتوسيعه.'),
  ('benefits-online-therapy', 'فوائد العلاج عن بعد', 'العلاج عبر الإنترنت مقارنة بالحضوري.'),
  ('body-scan-meditation', 'تأمل مسح الجسد', 'مسح للجسد مدته 15 دقيقة.'),
  ('boundary-scripts', '5 نصوص لوضع الحدود', 'عبارات جاهزة للمحادثات الصعبة.'),
  ('box-breathing', 'التنفس المربع في 60 ثانية', 'طريقة 4-4-4-4 لتهدئة الجهاز العصبي بسرعة.'),
  ('breathing-478-audio', 'تنفس 4-7-8', 'تسجيل صوتي موجّه لتقنية 4-7-8.'),
  ('cbt-thought-record', 'بطاقة الأفكار في العلاج المعرفي السلوكي', 'بطاقة قابلة للتحميل لرصد الأفكار السلبية.'),
  ('cognitive-defusion', 'فك الارتباط بالأفكار القلقة', 'ملاحظة الأفكار دون الانسياق وراءها: تقنية من علاج القبول والالتزام.'),
  ('dear-man-script', 'DEAR MAN: اطلب ما تحتاجه', 'نص من العلاج الجدلي السلوكي لطلبات حازمة ومحترمة.'),
  ('deep-work-blocks', 'فترات العمل العميق', 'فترتان من 90 دقيقة أفضل من ثماني ساعات مشتتة.'),
  ('do-i-need-therapy', 'هل أحتاج إلى علاج نفسي؟', 'علامات تشير إلى أن الدعم المهني قد يساعد.'),
  ('find-right-psychologist', 'اختيار الأخصائي النفسي المناسب', 'دليل لاختيار المعالج الذي يناسبك.'),
  ('grounding-54321', 'التأريض 5-4-3-2-1', 'استعمل حواسك الخمس لقطع موجة القلق.'),
  ('i-statements', 'عبارات «أنا» التي تنجح', 'استبدل اللوم بالمسؤولية في 3 خطوات.'),
  ('mental-health-at-work', 'الصحة النفسية في العمل', 'استراتيجيات لتدبير ضغط العمل.'),
  ('mindfulness-beginners', 'اليقظة الذهنية للمبتدئين', 'ابدأ ممارسة بسيطة لليقظة الذهنية.'),
  ('pleasure-mastery-log', 'سجل المتعة والإتقان', 'قيّم أنشطتك اليومية لتكتشف ما يفيدك.'),
  ('post-event-debrief', 'مراجعة ما بعد الحدث في 4 أسئلة', 'حوّل كل تجربة إلى نظام للتعلم.'),
  ('pre-performance-routine', 'روتين ما قبل الأداء', 'تسخين ذهني من 5 دقائق يستعمله رياضيو النخبة.'),
  ('repair-after-conflict', 'الإصلاح بعد الخلاف', 'مسار من 4 خطوات من أبحاث Gottman لاستعادة الثقة.'),
  ('self-compassion-break', 'استراحة التعاطف مع الذات في 3 خطوات', 'ممارسة Kristin Neff البسيطة للحظات الصعبة.'),
  ('sleep-hygiene-checklist', 'قائمة نظافة النوم', 'ثماني عادات قائمة على العلم تحل معظم مشاكل النوم.'),
  ('sport-mental-prep', 'التحضير الذهني للرياضي', 'التخيل وروتين رياضيي المستوى العالي.'),
  ('stimulus-control', 'ضبط المثير لعلاج الأرق', 'أعد تدريب دماغك على ربط السرير بالنوم لا باليقظة.'),
  ('support-loved-one', 'كيف تدعم شخصاً عزيزاً', 'طرق متعاطفة لمساندة قريب.'),
  ('understanding-anxiety', 'فهم القلق', 'مدخل واضح إلى القلق وطرق تدبيره.'),
  ('understanding-depression', 'فهم الاكتئاب', 'كيف يظهر الاكتئاب ومتى تطلب المساعدة.'),
  ('values-compass', 'بوصلة القيم', 'حين يضيع الاتجاه، تقودك القيم. تمرين من 5 دقائق.'),
  ('visualization-script', 'نص تخيل للثقة الهادئة', 'تكرار ذهني من 5 دقائق تسجله على هاتفك.'),
  ('wind-down-protocol', 'بروتوكول التهدئة في 60 دقيقة', 'روتين مسائي يخبر الدماغ أن وقت النوم قد حان.'),
  ('worry-parking', 'ركن الهموم قبل النوم', 'دوّن هموم الغد لتريح ذهنك.'),
  ('worry-postponement', 'نافذة الهموم', 'خصص لهمومك نافذة ثابتة من 15 دقيقة.')
) AS v(slug, title_ar, summary_ar)
WHERE r.slug = v.slug;

UPDATE public.resource_topics AS t SET name_ar = COALESCE(t.name_ar, v.name_ar)
FROM (VALUES
  ('anxiety', 'القلق'),
  ('depression', 'الاكتئاب'),
  ('mindfulness', 'اليقظة الذهنية'),
  ('relationships', 'العلاقات'),
  ('self-esteem', 'تقدير الذات'),
  ('sport', 'علم النفس الرياضي'),
  ('stress', 'تدبير الضغط'),
  ('workplace', 'العمل')
) AS v(slug, name_ar)
WHERE t.slug = v.slug;
