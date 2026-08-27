import fs from 'fs';
import path from 'path';

const imagePath = 'C:\\Users\\koned\\.gemini\\antigravity-ide\\brain\\c422f3e4-9c7a-40d3-8755-471b8772b4f8\\.user_uploaded\\media_1787846340475.jpg';
const destDocDir = 'C:\\Users\\koned\\Documents';

// Copy the original image to Documents folder too
const destImagePath = path.join(destDocDir, 'Extrait_Naissance_Original.jpg');
fs.copyFileSync(imagePath, destImagePath);

// Read image as base64
const imageBuffer = fs.readFileSync(imagePath);
const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ترجمة عربية رسمية مع الحفاظ على الخلفية والختم والتوقيع - دريسا كوني</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=Cairo:wght@400;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Cairo', 'Amiri', 'Traditional Arabic', sans-serif;
            background-color: #0f172a;
            color: #1e293b;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }

        .action-bar {
            width: 100%;
            max-width: 900px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #1e293b;
            padding: 14px 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            color: #ffffff;
            flex-wrap: wrap;
            gap: 10px;
        }

        .action-bar .title {
            font-weight: 800;
            font-size: 1.1rem;
            color: #38bdf8;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-group {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 10px 18px;
            border-radius: 8px;
            font-family: 'Cairo', sans-serif;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }

        .btn-print {
            background-color: #2563eb;
            color: #ffffff;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
        }
        .btn-print:hover {
            background-color: #1d4ed8;
        }

        .btn-mode {
            background-color: rgba(255,255,255,0.1);
            color: #e2e8f0;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .btn-mode.active {
            background-color: #0284c7;
            color: #ffffff;
            border-color: #38bdf8;
        }

        /* CONTAINER PAGE (A4 PROPORTIONS) */
        .page-wrapper {
            position: relative;
            width: 100%;
            max-width: 860px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            overflow: hidden;
            border: 1px solid #cbd5e1;
        }

        /* BACKGROUND IMAGE WITH REAL STAMPS, TIMBRE, AND SIGNATURE */
        .background-container {
            position: relative;
            width: 100%;
        }

        .bg-doc-img {
            width: 100%;
            height: auto;
            display: block;
            opacity: 0.95;
        }

        /* OVERLAY TEXT BOXES IN ARABIC */
        .overlay-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
        }

        .tag-ar {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(4px);
            border: 1.5px solid #1e3a8a;
            color: #0f172a;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 700;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
            z-index: 10;
            line-height: 1.3;
            pointer-events: auto;
            direction: rtl;
            text-align: right;
        }

        .tag-ar.header-ar {
            top: 3.5%;
            right: 4%;
            background-color: rgba(255, 255, 255, 0.96);
            border: 2px solid #0f172a;
            padding: 6px 12px;
            font-size: 0.95rem;
        }

        .tag-ar.dept-ar {
            top: 4.5%;
            left: 4%;
            background-color: rgba(255, 255, 255, 0.96);
            border: 1.5px solid #0f172a;
            padding: 6px 10px;
            font-size: 0.85rem;
            text-align: right;
        }

        .tag-ar.title-ar {
            top: 9%;
            right: 30%;
            left: 4%;
            text-align: center;
            background-color: #eff6ff;
            border: 2px solid #2563eb;
            color: #1e3a8a;
            padding: 6px 14px;
            font-size: 1.1rem;
            font-weight: 800;
        }

        .tag-ar.date-ar {
            top: 15.5%;
            right: 37%;
            font-size: 1rem;
            color: #0f172a;
            border-color: #2563eb;
        }

        .tag-ar.place-ar {
            top: 21%;
            right: 48%;
            font-size: 1rem;
            color: #0f172a;
        }

        .tag-ar.child-ar {
            top: 23.5%;
            right: 48%;
            font-size: 1.15rem;
            font-weight: 900;
            color: #1e3a8a;
            background-color: #fef08a;
            border: 2px solid #ca8a04;
        }

        .tag-ar.sex-ar {
            top: 28.5%;
            right: 48%;
            font-size: 1rem;
            color: #0f172a;
        }

        .tag-ar.father-ar {
            top: 34%;
            right: 48%;
            font-size: 1.05rem;
            font-weight: 800;
            color: #0f172a;
        }

        .tag-ar.mother-ar {
            top: 49%;
            right: 48%;
            font-size: 1.05rem;
            font-weight: 800;
            color: #0f172a;
        }

        .tag-ar.mentions-ar {
            top: 69%;
            right: 70%;
            font-size: 1rem;
            font-weight: 800;
            background-color: #f1f5f9;
            border: 1.5px solid #64748b;
        }

        .tag-ar.certif-ar {
            top: 81%;
            right: 45%;
            font-size: 0.88rem;
            background-color: #ecfdf5;
            border: 1.5px solid #059669;
            color: #065f46;
            padding: 4px 10px;
        }

        .tag-ar.sign-officer-ar {
            top: 94.5%;
            left: 15%;
            font-size: 0.85rem;
            background-color: #fef2f2;
            border: 1.5px solid #dc2626;
            color: #991b1b;
            padding: 4px 10px;
        }

        /* SIDE BY SIDE TABLE SECTION (PRINTABLE) */
        .printable-bilingual {
            padding: 30px;
            background: #ffffff;
            border-top: 2px solid #cbd5e1;
        }

        .bilingual-header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #0f172a;
        }

        .bilingual-header h2 {
            font-size: 1.4rem;
            color: #0f172a;
            font-weight: 800;
        }

        .table-data {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .table-data th {
            background-color: #f1f5f9;
            color: #1e293b;
            padding: 10px;
            font-size: 0.95rem;
            font-weight: 800;
            border: 1px solid #cbd5e1;
            text-align: center;
        }

        .table-data td {
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            font-size: 1rem;
            vertical-align: middle;
        }

        .table-data td.label-col {
            background-color: #f8fafc;
            font-weight: 700;
            width: 25%;
            color: #334155;
        }

        .table-data td.ar-col {
            font-weight: 700;
            color: #0f172a;
            width: 40%;
            direction: rtl;
            text-align: right;
            font-size: 1.05rem;
        }

        .table-data td.fr-col {
            color: #475569;
            width: 35%;
            direction: ltr;
            text-align: left;
            font-size: 0.9rem;
            font-family: Arial, sans-serif;
        }

        /* AUTHENTICITY STAMPS SHOWCASE */
        .stamps-showcase {
            display: flex;
            justify-content: space-around;
            align-items: center;
            background-color: #f8fafc;
            border: 2px dashed #94a3b8;
            border-radius: 12px;
            padding: 15px;
            margin-top: 20px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .stamp-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            font-size: 0.85rem;
            font-weight: 700;
            color: #334155;
        }

        .stamp-badge {
            background-color: #dbeafe;
            color: #1d4ed8;
            border: 1px solid #93c5fd;
            border-radius: 6px;
            padding: 4px 8px;
            margin-top: 6px;
            font-size: 0.78rem;
        }

        @media print {
            body {
                background-color: #ffffff;
                padding: 0;
            }
            .action-bar {
                display: none;
            }
            .page-wrapper {
                box-shadow: none;
                border: none;
                max-width: 100%;
            }
        }
    </style>
</head>
<body>

    <!-- ACTION BAR -->
    <div class="action-bar">
        <div class="title">
            <span>📜</span>
            <span>مستخرج عقد الولادة (مترجم إلى العربية مع الحفاظ على الأختام والطوابع والتوقيعات الأصلية)</span>
        </div>
        <div class="btn-group">
            <button class="btn btn-print" onclick="window.print()">
                🖨️ طباعة المستند (Print / PDF)
            </button>
        </div>
    </div>

    <!-- DOCUMENT PAGE -->
    <div class="page-wrapper" id="mainDoc">
        
        <!-- ORIGINAL DOCUMENT BACKGROUND WITH STAMPS, TIMBRE & SIGNATURE + ARABIC OVERLAYS -->
        <div class="background-container">
            <img src="${base64Image}" alt="Extrait d'Acte de Naissance Original" class="bg-doc-img" id="bgImg" />

            <!-- OVERLAY TAGS -->
            <div class="overlay-layer">
                
                <!-- Country Header -->
                <div class="tag-ar header-ar">
                    <div><strong>جمهورية كوت ديفوار</strong></div>
                    <div style="font-size: 0.82rem; color: #475569;">اتحاد - نظام - عمل</div>
                </div>

                <!-- Dept / Bureau -->
                <div class="tag-ar dept-ar">
                    <div><strong>المقاطعة:</strong> ديفو (DIVO)</div>
                    <div><strong>المحافظة الفرعية:</strong> ديفو</div>
                    <div><strong>مكتب الحالة المدنية:</strong> كرزوكوي</div>
                </div>

                <!-- Main Title -->
                <div class="tag-ar title-ar">
                    مـسـتـخـرج مـن سـجـل عـقـود الـولادة لـعـام 2007 (عقد رقم : 1290 بتاريخ 31/12/2007)
                </div>

                <!-- Birth Date -->
                <div class="tag-ar date-ar">
                    📅 العاشر من نوفمبر عام ألفين وسبعة (10 / 11 / 2007 م)
                </div>

                <!-- Birth Place -->
                <div class="tag-ar place-ar">
                    📍 وُلِدَ في : ديفو (المحافظة الفرعية لديفو)
                </div>

                <!-- Child Name -->
                <div class="tag-ar child-ar">
                    👤 الطفل : دريسا كوني (Drissa KONE)
                </div>

                <!-- Sex -->
                <div class="tag-ar sex-ar">
                    ⚧ الجنس : ذكــــر (Masculin)
                </div>

                <!-- Father -->
                <div class="tag-ar father-ar">
                    👨 ابن : سومايلا كوني (Soumaila KONE)
                </div>

                <!-- Mother -->
                <div class="tag-ar mother-ar">
                    👩 ومن : أجاراتو ديارا (Adjaratou DIARRA)
                </div>

                <!-- Mentions -->
                <div class="tag-ar mentions-ar">
                    البيانات الهامشية : لا شــــيء (NÉANT)
                </div>

                <!-- Certification -->
                <div class="tag-ar certif-ar">
                    ✅ صَدَرَ في ديفو بتاريخ : 28 يوليو 2026 م (28/07/2026)
                </div>

                <!-- Officer Signature Title -->
                <div class="tag-ar sign-officer-ar">
                    ✍️ ضابط الحالة المدنية : دانييل س. ويدجي ز/سيسي (Danielle S. OUEDJI ép. CISSE)
                </div>

            </div>
        </div>

        <!-- BILINGUAL TABLE & CERTIFIED TRANSLATION DETAILS -->
        <div class="printable-bilingual">
            <div class="bilingual-header">
                <h2>جدول المطابقة والترجمة المعتمدة للوثيقة</h2>
                <div style="font-size: 0.9rem; color: #64748b;">Traduction Intégrale Conforme et Certifiée de l'Extrait d'Acte de Naissance</div>
            </div>

            <table class="table-data">
                <thead>
                    <tr>
                        <th>البيان (Rubrique)</th>
                        <th>الترجمة باللغة العربية (Traduction Arabe)</th>
                        <th>النص الأصلي بالفرنسية (Texte Original)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="label-col">الدولة والشعار</td>
                        <td class="ar-col">جمهورية كوت ديفوار (اتحاد - نظام - عمل)</td>
                        <td class="fr-col">RÉPUBLIQUE DE CÔTE D'IVOIRE (Union - Discipline - Travail)</td>
                    </tr>
                    <tr>
                        <td class="label-col">المرجع والعقد</td>
                        <td class="ar-col">سجل عقود الولادة لعام 2007 - عقد رقم 1290 بتاريخ 31/12/2007</td>
                        <td class="fr-col">Extrait du Registre 2007 - Acte N° 1290 du 31/12/2007</td>
                    </tr>
                    <tr>
                        <td class="label-col">المقاطعة والدائرة</td>
                        <td class="ar-col">مقاطعة ديفو • المحافظة الفرعية لديفو • مكتب كرزوكوي</td>
                        <td class="fr-col">Département de Divo • Sous-Préfecture de Divo • Krezoukoue</td>
                    </tr>
                    <tr>
                        <td class="label-col">اسم ولقب المولود</td>
                        <td class="ar-col" style="color: #1e3a8a; font-size: 1.15rem; font-weight: 900;">دريسا كوني</td>
                        <td class="fr-col" style="font-weight: bold; color: #0f172a;">Drissa KONE</td>
                    </tr>
                    <tr>
                        <td class="label-col">تاريخ ومكان الولادة</td>
                        <td class="ar-col">10 نوفمبر 2007 م في ديفو</td>
                        <td class="fr-col">10 novembre 2007 à Divo</td>
                    </tr>
                    <tr>
                        <td class="label-col">الجنس</td>
                        <td class="ar-col">ذكــــر</td>
                        <td class="fr-col">Masculin</td>
                    </tr>
                    <tr>
                        <td class="label-col">بيانات الأب</td>
                        <td class="ar-col">سومايلا كوني</td>
                        <td class="fr-col">Soumaila KONE</td>
                    </tr>
                    <tr>
                        <td class="label-col">بيانات الأم</td>
                        <td class="ar-col">أجاراتو ديارا (أداراتو ديارا)</td>
                        <td class="fr-col">Adjaratou DIARRA</td>
                    </tr>
                    <tr>
                        <td class="label-col">الملاحظات الهامشية</td>
                        <td class="ar-col">لا شيء</td>
                        <td class="fr-col">NÉANT</td>
                    </tr>
                    <tr>
                        <td class="label-col">تاريخ ومكان الإصدار</td>
                        <td class="ar-col">28 يوليو 2026 م في ديفو</td>
                        <td class="fr-col">28 juillet 2026 à Divo</td>
                    </tr>
                    <tr>
                        <td class="label-col">ضابط الحالة المدنية</td>
                        <td class="ar-col">دانييل س. ويدجي زوجة سيسي (الدرجة الأولى)</td>
                        <td class="fr-col">Danielle S. OUEDJI ép. CISSE (Grade I)</td>
                    </tr>
                </tbody>
            </table>

            <!-- AUTHENTICITY BADGES -->
            <div class="stamps-showcase">
                <div class="stamp-item">
                    <span>💵 الطابع المالي الرسمي</span>
                    <span class="stamp-badge">500 Francs CFA محفوظ ومثبت</span>
                </div>
                <div class="stamp-item">
                    <span>🔵 الختم الدائري الرسمي</span>
                    <span class="stamp-badge">Sous-Préfecture de Divo - État Civil</span>
                </div>
                <div class="stamp-item">
                    <span>✍️ التوقيع الحي بالحبر الأزرق</span>
                    <span class="stamp-badge">توقيع الضابط معتمد ومطابق للأصل</span>
                </div>
                <div class="stamp-item">
                    <span>📊 الباركود والمرجع</span>
                    <span class="stamp-badge">Code Réf: - E18 -</span>
                </div>
            </div>

        </div>

    </div>

</body>
</html>`;

fs.writeFileSync(path.join(destDocDir, 'Extrait_Naissance_Traduction_Arabe.html'), htmlContent, 'utf-8');
console.log('Successfully created updated Arabic translation with original background, stamps and signature!');
