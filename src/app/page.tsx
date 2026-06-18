import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomePage from "@/components/HomePage";

export default function Page() {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden">
        <HomePage />
      </main>
      <Footer />
    </>
  );
}
