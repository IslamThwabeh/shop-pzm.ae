import Seo from '../components/Seo'
import { siteContact, siteIdentity } from '../content/siteData'
import { useLanguage } from '../context/LanguageContext'
import { buildWhatsAppHref } from '../utils/contact'

export default function ReturnPolicyPage() {
  const { lang } = useLanguage()
  const isAr = lang === 'ar'
  const seoTitle = isAr ? 'سياسة الإرجاع والاسترداد | PZM دبي' : 'Return & Refund Policy | PZM Dubai'
  const seoDescription = isAr
    ? 'سياسة الإرجاع والاسترداد لمتجر PZM للحواسيب والهواتف في دبي.'
    : 'Return and refund policy for PZM Computers & Phones in Dubai — eligibility, defective items, exchanges, and used devices.'
  const introParagraph = isAr
    ? `في ${siteIdentity.name}، نلتزم بتقديم تجربة شراء واضحة ومرضية مع كل طلب. توضح هذه السياسة شروط الإرجاع والاسترداد للمنتجات المشتراة من متجرنا في البرشاء، دبي، أو من خلال خدمة التوصيل داخل الإمارات.`
    : `At ${siteIdentity.name}, we are committed to ensuring your satisfaction with every purchase. This policy outlines the terms and conditions for returns and refunds on products purchased from our store in Al Barsha, Dubai, or via our delivery service across the UAE.`
  const returnEligibilityItems = isAr
    ? [
        'يجب أن يكون المنتج في عبوته الأصلية المغلقة (مختوم).',
        'ألا يكون قد تم تفعيله أو استخدامه أو إتلافه من قبل العميل.',
        'أن تكون جميع الملحقات والكتيبات وبطاقات الضمان الأصلية مرفقة.',
        'تقديم إثبات شراء صالح أو فاتورة أو تأكيد الطلب.',
      ]
    : [
        'The product is in its original, unopened packaging (sealed condition).',
        'The product has not been activated, used, or damaged by the customer.',
        'All original accessories, manuals, and warranty cards are included.',
        'A valid proof of purchase, receipt, or order confirmation is provided.',
      ]
  const nonReturnableItems = isAr
    ? [
        'المنتجات التي تم فتحها أو تفعيلها أو استخدامها.',
        'الكفرات وواقيات الشاشة والملحقات التي تم تركيبها أو استخدامها.',
        'المنتجات التي تعرضت للتلف بعد التسليم بسبب العميل.',
        'أجهزة الكمبيوتر المجمعة حسب الطلب والطلبات المخصصة.',
        'البرامج والمنتجات الرقمية وبطاقات الهدايا.',
      ]
    : [
        'Products that have been opened, activated, or used.',
        'Cases, screen protectors, and accessories that have already been applied or used.',
        'Products damaged after delivery by the customer.',
        'Custom-built PCs and configured-to-order items.',
        'Software, digital products, and gift cards.',
      ]
  const defectiveItems = isAr
    ? [
        'تواصل معنا خلال 48 ساعة من الاستلام.',
        'سنقوم بترتيب استبدال مجاني أو استرداد كامل للحالات المؤهلة.',
        'المنتجات المعيبة المشمولة بضمان الشركة المصنعة تُعالج عبر مسار الضمان الرسمي.',
      ]
    : [
        'Contact us within 48 hours of delivery.',
        'We will arrange a free replacement or full refund for eligible cases.',
        'Defective items under manufacturer warranty will be handled through the official warranty process.',
      ]
  const refundItems = isAr
    ? [
        'طلبات الدفع عند الاستلام: يتم الاسترداد نقداً من المتجر أو عبر تحويل بنكي خلال 5 إلى 7 أيام عمل.',
        'طلبات الدفع عبر الرابط: يتم الاسترداد إلى وسيلة الدفع الأصلية خلال 5 إلى 7 أيام عمل.',
        'رسوم الشحن غير قابلة للاسترداد إلا إذا كان سبب الإرجاع منتجاً خاطئاً أو معيباً.',
      ]
    : [
        'Cash on Delivery orders: Refund via cash at our store or bank transfer within 5 to 7 business days.',
        'Pay-by-link orders: Refund to the original payment method within 5 to 7 business days.',
        'Shipping fees are non-refundable unless the return is due to a defective or incorrect product.',
      ]

  return (
    <div className="rounded-[28px] border border-brandBorder bg-white p-8 shadow-sm md:p-10">
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonicalPath="/return-policy"
        hreflangPath="/return-policy"
      />

      <h1 className="mb-4 text-3xl font-bold text-primary">{isAr ? 'سياسة الإرجاع والاسترداد' : 'Return & Refund Policy'}</h1>
      <p className="mb-8 text-brandTextDark">{isAr ? 'آخر تحديث: 24 مارس 2026' : 'Last updated: March 24, 2026'}</p>

      <section className="mb-10 space-y-3">
        <p className="text-brandTextMedium">
          {introParagraph}
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '1. شروط قبول الإرجاع' : '1. Return Eligibility'}</h2>
        <p className="text-brandTextMedium">
          {isAr
            ? 'يمكنك إرجاع المنتج خلال 7 أيام من تاريخ الشراء أو التسليم إذا تحققت الشروط التالية:'
            : 'You may return a product within 7 days of the delivery or purchase date, provided the following conditions are met:'}
        </p>
         <ul className="list-disc space-y-2 ps-5 text-brandTextMedium">
          {returnEligibilityItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '2. المنتجات غير القابلة للإرجاع' : '2. Non-Returnable Items'}</h2>
        <p className="text-brandTextMedium">{isAr ? 'العناصر التالية غير مؤهلة للإرجاع أو الاسترداد:' : 'The following items are not eligible for return or refund:'}</p>
        <ul className="list-disc space-y-2 ps-5 text-brandTextMedium">
          {nonReturnableItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '3. المنتجات التالفة أو المعيبة' : '3. Defective or Damaged Products'}</h2>
        <p className="text-brandTextMedium">{isAr ? 'إذا استلمت منتجاً تالفاً أو معيباً:' : 'If you receive a defective or damaged product:'}</p>
        <ul className="list-disc space-y-2 ps-5 text-brandTextMedium">
          {defectiveItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '4. طريقة بدء طلب الإرجاع' : '4. How to Initiate a Return'}</h2>
        <p className="text-brandTextMedium">{isAr ? 'لبدء طلب الإرجاع، يرجى التواصل معنا عبر إحدى الوسائل التالية:' : 'To start a return, please contact us through one of the following:'}</p>
        <div className="space-y-3 rounded-2xl border-s-4 border-primary bg-brandLight p-5 text-brandTextDark">
          <p>
            <strong>{isAr ? 'واتساب:' : 'WhatsApp:'}</strong>{' '}
            <a href={buildWhatsAppHref('Hi, I would like to initiate a return. (via pzm.ae)')} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
              {siteContact.phoneDisplay}
            </a>
          </p>
          <p>
            <strong>{isAr ? 'الهاتف:' : 'Phone:'}</strong>{' '}
            <a href={siteContact.phoneHref} className="font-semibold text-primary hover:underline">
              {siteContact.phoneDisplay}
            </a>
          </p>
          <p>
            <strong>{isAr ? 'زرنا:' : 'Visit us:'}</strong>{' '}
            {isAr
              ? `${siteIdentity.name}، شارع حصة، البرشاء، دبي (داخل هِسّة يونيون كووب هايبرماركت، الطابق الأرضي)`
              : `${siteIdentity.name}, Hessa Street, Al Barsha, Dubai (Inside Hessa Union Coop Hypermarket, Ground Floor)`}
          </p>
        </div>
        <p className="text-brandTextMedium">
          {isAr ? 'سيقوم فريقنا بمراجعة الطلب وإرسال خطوات الإرجاع خلال 24 ساعة.' : 'Our team will review your request and provide return instructions within 24 hours.'}
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '5. آلية الاسترداد' : '5. Refund Process'}</h2>
        <ul className="list-disc space-y-2 ps-5 text-brandTextMedium">
          {refundItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '6. سياسة الاستبدال' : '6. Exchange Policy'}</h2>
        <p className="text-brandTextMedium">
          {isAr
            ? 'نوفر استبدال المنتجات خلال نافذة الإرجاع البالغة 7 أيام، مع الالتزام بنفس الشروط المذكورة أعلاه. أما الاستبدال بمنتج أعلى سعراً فيتطلب دفع فرق السعر.'
            : 'We offer product exchanges within the 7-day return window, subject to the same return conditions above. Exchanges for a higher-value product require payment of the price difference.'}
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '7. الأجهزة المستعملة والمعتمدة' : '7. Used &amp; Pre-owned Devices'}</h2>
        <p className="text-brandTextMedium">
          {isAr
            ? 'تُباع الأجهزة المستعملة كما هي. ولا تُقبل الإرجاعات إلا إذا ظهر عيب هاردوير خلال 3 أيام من الشراء ولم يكن قد تم الإفصاح عنه وقت البيع.'
            : 'Used and pre-owned devices are sold as-is. Returns on used devices are accepted only if a hardware defect is discovered within 3 days of purchase that was not disclosed at the time of sale.'}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-brandTextDark">{isAr ? '8. تواصل معنا' : '8. Contact Us'}</h2>
        <p className="text-brandTextMedium">
          {isAr ? (
            <>
              إذا كان لديك أي سؤال حول هذه السياسة، يرجى التواصل معنا عبر واتساب على{' '}
              <a href={buildWhatsAppHref('Hi, I have a question about your return policy. (via pzm.ae)')} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{siteContact.phoneDisplay}</a>
              ، أو بالاتصال على{' '}
              <a href={siteContact.phoneHref} className="text-primary hover:underline">{siteContact.phoneDisplay}</a>
              ، أو بزيارة فرعنا في البرشاء على شارع حصة، دبي.
            </>
          ) : (
            <>
              If you have any questions about this policy, please reach out via WhatsApp at{' '}
              <a href={buildWhatsAppHref('Hi, I have a question about your return policy. (via pzm.ae)')} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{siteContact.phoneDisplay}</a>
              , by phone at <a href={siteContact.phoneHref} className="text-primary hover:underline">{siteContact.phoneDisplay}</a>, or at our Al Barsha, Hessa Street, Dubai location.
            </>
          )}
        </p>
      </section>
    </div>
  )
}