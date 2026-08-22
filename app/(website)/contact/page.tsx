import ContactForm from "@/components/forms/ContactForm";

export default function ContactPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 sm:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 font-sans">
      {/* Column 1: Contact Details */}
      <div className="space-y-8">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
            Contact
          </span>
          <h1 className="text-4xl font-serif font-medium text-brand-slate-900">
            Get in Touch
          </h1>
          <p className="text-sm text-brand-text-muted max-w-md">
            Have questions regarding our business divisions, growth models, or board governance?
            Submit an inquiry, and our corporate communications desk will follow up.
          </p>
        </div>

        {/* Office Details */}
        <div className="space-y-6 text-sm text-brand-slate-900">
          <div className="space-y-1">
            <h4 className="text-xs uppercase font-bold text-slate-500">Corporate Head Office</h4>
            <p className="font-medium">Rubinsons Private Limited</p>
            <p className="text-brand-text-muted text-xs">
              Registered Office Address, New Delhi, India
            </p>
          </div>

          <div className="space-y-1">
            <h4 className="text-xs uppercase font-bold text-slate-500">General Inquiries</h4>
            <p className="text-brand-bronze-dark font-medium">contact@rubinsons.com</p>
          </div>
        </div>

        {/* Independent NGO Notice */}
        <div className="border-l-2 border-brand-bronze pl-4 text-xs text-brand-text-muted leading-relaxed">
          <strong>Rudra Vahini Foundation:</strong> For inquiries regarding CSR programs or NGO collaborations,
          please check the Foundation checkbox or direct emails to NGO desks.
        </div>
      </div>

      {/* Column 2: Interactive Form */}
      <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded shadow-sm">
        <h3 className="text-xl font-serif font-medium text-brand-slate-900 border-b border-slate-100 pb-4 mb-6">
          Submit Inquiry
        </h3>
        <ContactForm />
      </div>
    </main>
  );
}
