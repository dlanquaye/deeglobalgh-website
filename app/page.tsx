export default function Home() {
  const categories = [
    { name: "Textbooks", desc: "Pre-School to SHS" },
    { name: "JHS Combined Edition Textbooks", desc: "JHS 1–3 combined books" },
    { name: "SHS Combined Edition Textbooks", desc: "SHS 1–3 combined books" },
    { name: "Exam Materials", desc: "BECE & WASSCE" },
    { name: "School Essentials", desc: "Stationery & supplies" },
    { name: "Dormitory Essentials", desc: "Boarding student items" },
    { name: "Uniforms & Clothing Essentials", desc: "Underwear, socks & uniforms" },
    { name: "Drawing & Technical", desc: "Drawing boards & sets" },
    { name: "Bags & Lunch Packs", desc: "Bags, lunch boxes, bottles" },
    { name: "Calculators", desc: "Scientific calculators" },
  ];

  const levels = [
    "Pre-School",
    "Basic 1",
    "Basic 2",
    "Basic 3",
    "Basic 4",
    "Basic 5",
    "Basic 6",
    "JHS 1",
    "JHS 2",
    "JHS 3",
    "SHS 1",
    "SHS 2",
    "SHS 3",
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <div className="font-bold text-lg">DeeglobalGh</div>

          {/* Big Search */}
          <div className="flex-1">
            <input
              className="w-full rounded-xl border px-4 py-3 text-base outline-none focus:ring-2 focus:ring-black"
              placeholder="Search books, stationery, dorm items, underwear..."
            />
          </div>

          {/* Cart */}
          <button className="rounded-xl border px-4 py-3 font-medium hover:bg-gray-50">
            Cart
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded-2xl border bg-gray-50 p-6">
          <h1 className="text-2xl font-bold">
            Shop Textbooks, Stationery & School Essentials in Ghana
          </h1>
          <p className="mt-2 text-gray-700">
            Fast delivery. Secure checkout. Easy shopping for parents and students.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button className="rounded-xl bg-black px-5 py-3 font-semibold text-white">
              Shop All Products
            </button>
            <button className="rounded-xl border px-5 py-3 font-semibold">
              WhatsApp Support
            </button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <div
              key={c.name}
              className="rounded-2xl border p-5 hover:bg-gray-50 cursor-pointer"
            >
              <div className="text-lg font-semibold">{c.name}</div>
              <div className="mt-1 text-sm text-gray-600">{c.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by Level */}
      <section className="mx-auto max-w-6xl px-4 pb-14">
        <h2 className="text-xl font-bold">Shop by School Level</h2>
        <p className="mt-2 text-gray-700">
          Choose the class level and get the right items faster.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {levels.map((level) => (
            <button
              key={level}
              className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="font-semibold">Fast Delivery</div>
              <div className="mt-1 text-sm text-gray-600">
                Delivery across Kasoa, Accra and beyond.
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <div className="font-semibold">Secure Checkout</div>
              <div className="mt-1 text-sm text-gray-600">
                Pay with MoMo or card securely.
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <div className="font-semibold">WhatsApp Support</div>
              <div className="mt-1 text-sm text-gray-600">
                Ask questions before you buy.
              </div>
            </div>
            <div className="rounded-2xl border bg-white p-5">
              <div className="font-semibold">Trusted Shop</div>
              <div className="mt-1 text-sm text-gray-600">
                Genuine items and reliable service.
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} DeeglobalGh. All rights reserved.
          </div>
        </div>
      </section>
    </main>
  );
}
