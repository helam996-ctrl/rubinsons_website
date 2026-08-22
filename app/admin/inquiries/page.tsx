import { auth } from "@/auth";
import { prisma } from "@/lib/db/client";
import { redirect } from "next/navigation";

export default async function AdminInquiriesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  let inquiries = [];
  let isDbOffline = false;

  try {
    inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    isDbOffline = true;
    inquiries = [
      {
        id: "mock-i1",
        name: "Vikram Malhotra",
        email: "vikram@malhotraholdings.in",
        phone: "+919876543210",
        organisation: "Malhotra Holdings",
        type: "INVESTOR",
        message: "I am interested in requesting the Q3 investor prospectus pack for Rubinsons Builders and Infrastructure division. Please contact me at your convenience.",
        status: "NEW",
        createdAt: new Date("2026-08-19T10:00:00Z"),
      },
      {
        id: "mock-i2",
        name: "Anjali Gupta",
        email: "anjali.g@gmail.com",
        phone: "+919988776655",
        organisation: null,
        type: "GENERAL",
        message: "When does the next training cohort for hospitality education start at ICH Dien Academia? Thank you.",
        status: "CONTACTED",
        createdAt: new Date("2026-08-18T10:00:00Z"),
      },
    ];
  }


  return (
    <main className="p-8 space-y-6 overflow-y-auto flex-1 font-sans">
      <div>
        <span className="text-xs uppercase tracking-widest text-brand-bronze-dark font-semibold">
          Incoming Leads
        </span>
        <h1 className="text-3xl font-serif font-medium text-brand-slate-900 mt-0.5">
          Inquiries Inbox
        </h1>
      </div>

      {isDbOffline && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r">
          <p className="text-xs text-amber-800">
            <strong>Database Offline Mode</strong>: Displaying verified inquiry template entries. Status management and notes log actions are disabled.
          </p>
        </div>
      )}

      {/* Grid Table */}
      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden divide-y divide-slate-100">
        {inquiries.map((inq) => {
          // Pre-formatted mailto URL
          const mailtoUrl = `mailto:${inq.email}?subject=Re: Rubinsons Group Inquiry&body=Dear ${inq.name},%0D%0A%0D%0AThank you for contacting Rubinsons Group.`;

          // Clean phone digits for wa.me redirect (digits only, prepending 91 for India if needed)
          const cleanPhone = inq.phone ? inq.phone.replace(/\D/g, "") : "";
          const cleanedNumber = cleanPhone.startsWith("91")
            ? cleanPhone
            : `91${cleanPhone}`;

          const adminName = session?.user?.name || "Administration";
          const prefilledMessage = encodeURIComponent(
            `Hello ${inq.name}, this is ${adminName} from Rubinsons Group. We received your inquiry regarding ${inq.type}: "${inq.message.substring(0, 60)}...". We would like to follow up on your request.`
          );
          const whatsappUrl = `https://wa.me/${cleanedNumber}?text=${prefilledMessage}`;

          return (
            <div
              key={inq.id}
              className="p-6 flex flex-col lg:flex-row justify-between items-start gap-6 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-3 flex-1">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-semibold text-brand-slate-900">{inq.name}</h3>
                  <span
                    className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                      inq.status === "NEW"
                        ? "bg-amber-50 text-amber-800 ring-amber-600/20"
                        : inq.status === "CONTACTED"
                        ? "bg-blue-50 text-blue-800 ring-blue-600/20"
                        : "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
                    }`}
                  >
                    {inq.status}
                  </span>
                  <span className="text-xs text-brand-text-muted">
                    {inq.createdAt.toLocaleDateString()}
                  </span>
                </div>

                {/* Subtitle Details */}
                <div className="text-xs text-slate-500 space-y-1">
                  <p>
                    <strong>Email:</strong> {inq.email} | <strong>Phone:</strong> {inq.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Organization:</strong> {inq.organisation || "Individual"} |{" "}
                    <strong>Interest:</strong> {inq.type}
                  </p>
                </div>

                {/* Message Body */}
                <p className="text-sm text-brand-slate-800 leading-relaxed bg-slate-50 p-4 rounded border border-slate-100">
                  {inq.message}
                </p>
              </div>

              {/* CRM Action Buttons */}
              <div className="flex lg:flex-col gap-2 shrink-0 w-full lg:w-44 pt-2 lg:pt-0">
                <a
                  href={mailtoUrl}
                  className="flex-1 lg:w-full inline-flex justify-center items-center gap-1.5 px-3 py-2 border border-brand-slate-900 bg-brand-slate-900 text-white text-xs font-semibold rounded hover:bg-brand-slate-800 transition-colors"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                    />
                  </svg>
                  Reply via Email
                </a>

                {inq.phone && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 lg:w-full inline-flex justify-center items-center gap-1.5 px-3 py-2 border border-emerald-600 bg-emerald-600 text-white text-xs font-semibold rounded hover:bg-emerald-700 transition-colors"
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 2.51 1.489 4.415 1.49 5.385.002 9.774-4.382 9.777-9.77.002-2.61-1.014-5.059-2.865-6.915C16.12 2.1 13.684.088 11.076.087c-5.387 0-9.773 4.385-9.776 9.774-.001 1.905.5 2.82 1.46 4.426L1.705 20.35l6.096-1.597z" />
                    </svg>
                    WhatsApp Chat
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
