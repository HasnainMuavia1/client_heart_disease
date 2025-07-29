
import About from "../components/About";
import Footer from "../components/Footer";
import HeroSection from "../components/HeroSection";
import NavBar from "../components/NavBar";
import ServicesSection from "../components/ServicesSection";
import WhatsAppFloat from "../components/Whatsapp";

const HomePage = () => {
  return (
    <div>
      <NavBar />
      <HeroSection/>
      <ServicesSection/>
      <About/>
      <Footer/>
      <WhatsAppFloat/>
    </div>
  );
};

export default HomePage;
