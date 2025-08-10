import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap } from 'gsap'



const useAuth = () => ({
    login: (token, user) => {
        console.log('Login successful:', { token, user })
        localStorage.setItem('token', token)
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        }
    }
})

const SignIn = () => {
    const initialState = {
        Email: '',
        Password: ''
    }

    const [formData, setFormData] = useState(initialState)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [focusedField, setFocusedField] = useState('')
    const [isVisible, setIsVisible] = useState(true)

    const { login } = useAuth()
    const containerRef = useRef(null)
    const voteIconRef = useRef(null)


    useEffect(() => {
        if (!isVisible || !containerRef.current) return

        const ctx = gsap.context(() => {
            
            gsap.set(".particle", {
                opacity: 0,
                scale: 0,
                rotation: 0
            })

            gsap.to(".particle", {
                opacity: 0.6,
                scale: 1,
                rotation: 360,
                duration: 2,
                stagger: 0.1,
                repeat: -1,
                yoyo: true,
                ease: "power2.inOut"
            })

         
            if (voteIconRef.current) {
                gsap.to(voteIconRef.current, {
                    scale: 1.1,
                    duration: 2,
                    repeat: -1,
                    yoyo: true,
                    ease: "power2.inOut"
                })
            }

            
            gsap.fromTo(containerRef.current,
                {
                    y: 50,
                    opacity: 0,
                    scale: 0.9
                },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: "back.out(1.7)"
                }
            )
        }, containerRef)

        return () => ctx.revert()
    }, [isVisible])

 

    const fetchData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('http://localhost:1200/api/vote/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Email: formData.Email,
                    Password: formData.Password
                })
            })

            const data = await response.json()

            if (response.ok) {
             
                localStorage.setItem('token', data.token)
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user))
                }

                login(data.token, data.user)
                setFormData(initialState)

             
                if (containerRef.current) {
                    gsap.to(containerRef.current, {
                        scale: 0.95,
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.in",
                        onComplete: () => {
                            console.log('Redirecting to /vote')
                            // Use window.location after token is stored
                            setTimeout(() => {
                                window.location.href = '/home'
                            }, 100) // Small delay to ensure token is stored
                        }
                    })
                }
            } else {
                setError(data.message || 'Login failed')
            }
        } catch (err) {
            console.log('Error:', err)
            setError('Network error. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))

        if (error) setError(null)
    }

    const validatePassword = (password) => {
        const hasNumber = /\d/.test(password)
        const hasLetter = /[a-zA-Z]/.test(password)
        return hasNumber && hasLetter
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()

        if (!formData.Email || !formData.Password) {
            setError('Please fill in all fields')

         
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    x: [-10, 10, -10, 10, 0],
                    duration: 0.5,
                    ease: "power2.out"
                })
            }
            return
        }

        if (!validatePassword(formData.Password)) {
            setError('Password must contain both letters and numbers')

         
            if (containerRef.current) {
                gsap.to(containerRef.current, {
                    x: [-10, 10, -10, 10, 0],
                    duration: 0.5,
                    ease: "power2.out"
                })
            }
            return
        }

        await fetchData()
    }

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.6, -0.05, 0.01, 0.99],
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    }

    const buttonVariants = {
        idle: { scale: 1 },
        hover: {
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)",
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.98 }
    }

    if (!isVisible) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="text-8xl mb-6">✅</div>
                    <h2 className="text-4xl font-bold text-white mb-4">Login Successful!</h2>
                    <p className="text-xl text-gray-300">Redirecting to voting dashboard...</p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
          
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="particle absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                            rotate: [0, 360],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

        
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

            <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
                <motion.div
                    ref={containerRef}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md"
                >
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                        {/* Header Section */}
                        <motion.div
                            variants={itemVariants}
                            className="px-8 pt-10 pb-6 text-center relative"
                        >
                            {/* Decorative glow effect */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-3xl opacity-20" />

                            <motion.div
                                ref={voteIconRef}
                                className="text-7xl mb-6 relative z-10"
                                whileHover={{
                                    rotate: [0, -10, 10, 0],
                                    transition: { duration: 0.5 }
                                }}
                            >
                                🗳️
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-4xl font-black mb-3 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent"
                            >
                                Secure Vote
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-gray-300 text-lg"
                            >
                                Your voice. Your choice. Your future.
                            </motion.p>
                        </motion.div>

                        <div className="px-8 pb-8">
                            {/* Error Message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="mb-6 p-4 bg-red-500/20 backdrop-blur border border-red-400/30 text-red-300 rounded-2xl"
                                    >
                                        <div className="flex items-center">
                                            <motion.span
                                                animate={{ rotate: [0, 15, -15, 0] }}
                                                transition={{ duration: 0.5 }}
                                                className="text-xl mr-3"
                                            >
                                                ⚠️
                                            </motion.span>
                                            {error}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email Field */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-6 relative"
                            >
                                <label className="block text-sm font-semibold text-gray-200 mb-3">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur" />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <motion.svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            animate={{
                                                scale: focusedField === 'Email' ? 1.1 : 1,
                                                color: focusedField === 'Email' ? '#06b6d4' : '#9ca3af'
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </motion.svg>
                                    </div>
                                    <input
                                        type="email"
                                        name="Email"
                                        value={formData.Email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('Email')}
                                        onBlur={() => setFocusedField('')}
                                        className="relative block w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-lg"
                                        placeholder="your.email@domain.com"
                                        autoComplete="off"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </motion.div>

                            {/* Password Field */}
                            <motion.div
                                variants={itemVariants}
                                className="mb-6 relative"
                            >
                                <label className="block text-sm font-semibold text-gray-200 mb-3">
                                    Password
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur" />
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                                        <motion.svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            animate={{
                                                scale: focusedField === 'Password' ? 1.1 : 1,
                                                color: focusedField === 'Password' ? '#06b6d4' : '#9ca3af'
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </motion.svg>
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="Password"
                                        value={formData.Password}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('Password')}
                                        onBlur={() => setFocusedField('')}
                                        autoComplete="new-password"
                                        className="relative block w-full pl-12 pr-14 py-4 bg-white/10 backdrop-blur border border-white/20 rounded-2xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 text-lg"
                                        placeholder="Enter password with letters and numbers"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                                        disabled={isLoading}
                                    >
                                        <motion.svg
                                            className="h-5 w-5 text-gray-400 hover:text-cyan-400 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {showPassword ? (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M14.12 14.12l1.415 1.415M14.12 14.12L9.878 9.878m4.242 4.242L19.5 19.5" />
                                            ) : (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            )}
                                        </motion.svg>
                                    </button>
                                </div>
                            </motion.div>


                            <motion.button
                                variants={buttonVariants}
                                initial="idle"
                                whileHover={!isLoading ? "hover" : {}}
                                whileTap={!isLoading ? "tap" : {}}
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className={`relative w-full py-4 px-6 rounded-2xl font-bold text-lg text-white transition-all duration-300 overflow-hidden ${isLoading
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500'
                                    }`}
                            >

                                {!isLoading && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur" />
                                )}

                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center justify-center"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full mr-3"
                                            />
                                            Authenticating...
                                        </motion.div>
                                    ) : (
                                        <motion.span
                                            key="signin"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="relative z-10"
                                        >
                                            Cast Your Vote
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>


                        <motion.div
                            variants={itemVariants}
                            className="px-8 py-6 bg-white/5 backdrop-blur text-center border-t border-white/10"
                        >
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-lg"
                                >
                                    🔒
                                </motion.span>
                                <span className="font-medium">End-to-end encrypted</span>
                                <span>•</span>
                                <span>Verified secure</span>
                            </div>
                        </motion.div>
                    </div>


                    <motion.div
                        className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur opacity-60"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 0.8, 0.6]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full blur opacity-40"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.4, 0.7, 0.4]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1
                        }}
                    />
                </motion.div>
            </div>
        </div>
    )
}

export default SignIn