import AboutImg from '../assets/images/about-us.jpg';

const About = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto flex flex-col lg:flex-row items-center px-6 gap-8">
        {/* Image Section */}
        <div className="flex-1">
          <img
            src={AboutImg}
            alt="About Us"
            className="rounded-xl shadow-lg"
          />
        </div>

        {/* Description Section */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-red-800 mb-4">About Us</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Welcome to our Heart Disease Prediction System. Our mission is to
            provide accurate and reliable predictions to help you stay ahead in
            managing your heart health. Using advanced algorithms and data
            analytics, we empower individuals to take proactive measures for
            their well-being.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            Our dedicated team of professionals is committed to guiding and
            supporting you with resources, tools, and insights tailored to your
            needs. Join us in taking the first step toward a healthier life.
          </p>
          <button className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
