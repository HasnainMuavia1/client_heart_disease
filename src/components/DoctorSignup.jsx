import { useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi"

const DoctorSignup = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex-1 pr-12 hidden lg:block">
        <h1 className="mb-6 text-2xl font-bold text-red-600">DocTalk</h1>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Join Our Medical Network</h2>
        <p className="mb-8 text-gray-600">
          Create your professional profile to connect with patients, share your expertise, and contribute to our
          community of healthcare professionals.
        </p>
        <button className="rounded-md px-4 py-2 bg-red-600 text-white hover:bg-red-700">Learn More</button>
      </div>

      {/* Right Section - Sign Up Form */}
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold text-red-700">Doctor Registration</h3>
            <p className="mt-1 text-sm text-gray-600">Please complete your professional profile</p>
          </div>

          <form className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Contact Number"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="PMDC Registration Number"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <select className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500">
                <option value="">Select Specialization</option>
                <option value="cardiology">Cardiology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="psychiatry">Psychiatry</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="Qualification (e.g., MBBS, FCPS)"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Register as Doctor
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/signin" className="text-red-600 hover:text-red-700">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default DoctorSignup

