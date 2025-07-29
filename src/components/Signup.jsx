import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
    is_doctor: false,
    phone_number: '',
    // Doctor-specific fields
    specialization: '',
    hospital: '',
    experience_years: '',
    bio: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate form
      if (formData.password !== formData.password2) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      // Validate doctor-specific fields
      if (formData.is_doctor) {
        if (!formData.specialization) {
          setError('Specialization is required for doctor registration')
          setLoading(false)
          return
        }
        if (!formData.hospital) {
          setError('Hospital/Clinic is required for doctor registration')
          setLoading(false)
          return
        }
        if (!formData.experience_years && formData.experience_years !== 0) {
          setError('Years of experience is required for doctor registration')
          setLoading(false)
          return
        }
      }

      // Determine which endpoint to use based on role
      const endpoint = formData.is_doctor ? '/auth/register/doctor/' : '/auth/register/patient/'
      
      // Prepare data for submission
      const userData = {
        name: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        is_doctor: formData.is_doctor,
        phone_number: formData.phone_number || null
      }

      // If doctor, add doctor-specific fields
      if (formData.is_doctor) {
        userData.specialization = formData.specialization;
        userData.hospital = formData.hospital;
        userData.experience_years = parseInt(formData.experience_years, 10);
        userData.bio = formData.bio || '';
      }

      console.log('Submitting data:', userData);
      const response = await api.post(endpoint, userData)
      
      // Redirect to sign in page on success
      navigate('/signin', { state: { message: 'Registration successful! Please sign in.' } })
    } catch (err) {
      console.error('Registration error:', err.response)
      console.error('Error data:', err.response?.data)
      console.error('Error status:', err.response?.status)
      
      // More descriptive error message
      if (err.response?.status === 401) {
        setError('Authentication error. Please try again or contact support.')
      } else if (err.response?.data) {
        // Format validation errors
        if (typeof err.response.data === 'object') {
          const errorMessages = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n')
          setError(errorMessages || 'Registration failed with validation errors.')
        } else {
          setError(err.response.data.detail || 'Registration failed. Please try again.')
        }
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center justify-between">
      {/* Left Section */}
      <div className="flex-1 pr-12">
        <h1 className="mb-6 text-2xl font-bold text-red-600">
          Heart Disease Prediction
        </h1>
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          Join Heart Health Insights
        </h2>
        <p className="mb-8 text-gray-600">
          Create an account to access our comprehensive heart health prediction tools and
          personalized insights for better health monitoring.
        </p>
        <button className="rounded-md px-4 py-2 bg-red-600 text-white hover:bg-red-700">
          Learn More
        </button>
      </div>

      {/* Right Section - Sign Up Form */}
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold text-red-700">Create Account</h3>
            <p className="mt-1 text-sm text-gray-600">Please fill in your details to continue</p>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Username field */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Full name fields */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Email field */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Phone number field */}
            <div>
              <input
                type="tel"
                name="phone_number"
                placeholder="Phone Number (optional)"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Password fields */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
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

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password2"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Role selection */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">I am a:</span>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_doctor"
                  checked={!formData.is_doctor}
                  onChange={() => setFormData({...formData, is_doctor: false})}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-600">Patient</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_doctor"
                  checked={formData.is_doctor}
                  onChange={() => setFormData({...formData, is_doctor: true})}
                  className="h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm text-gray-600">Doctor</span>
              </label>
            </div>

            {/* Doctor-specific fields (conditionally rendered) */}
            {formData.is_doctor && (
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700">Doctor Information</h4>
                <input
                  type="text"
                  name="specialization"
                  placeholder="Specialization"
                  value={formData.specialization || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <input
                  type="text"
                  name="hospital"
                  placeholder="Hospital/Clinic"
                  value={formData.hospital || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <input
                  type="number"
                  name="experience_years"
                  placeholder="Years of Experience"
                  value={formData.experience_years || ''}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <textarea
                  name="bio"
                  placeholder="Professional Bio"
                  value={formData.bio || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                ></textarea>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <FcGoogle className="mr-2 h-4 w-4" />
              Sign up with Google
            </button>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
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

export default Signup

