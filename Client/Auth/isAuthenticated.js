import { useState, useEffect } from 'react'

const isAuthenticated = () => {
    const [token, setToken] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
   
        const storedToken = localStorage.getItem('token')
        
        if (storedToken) {
            setToken(storedToken)
          
            verifyToken(storedToken)
        } else {
            setIsLoading(false)
        }
    }, [])

    const verifyToken = async (tokenToVerify) => {
        try {
            const response = await fetch('https://cse-election.vercel.app/api/vote/user-status', {
                headers: {
                    'Authorization': `Bearer ${tokenToVerify}`
                }
            })
            
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            } else {
              
                localStorage.removeItem('token')
                setToken(null)
                setUser(null)
            }
        } catch (error) {
            console.error('Token verification failed:', error)
       
        } finally {
            setIsLoading(false)
        }
    }

    const login = (newToken, userData = null) => {
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    return {
        token,
        user,
        isLoading,
        isAuthenticated: !!token,
        login,
        logout
    }
}

export default isAuthenticated