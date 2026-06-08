"use client"

import { useState, FormEvent } from "react"

export default function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    console.log({ email, password })
    alert("Registratie (demo) ontvangen")
  }

  return (
    <form onSubmit={handleSubmit} style={{display: 'grid', gap: 8, maxWidth: 320}}>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>

      <label>
        Wachtwoord
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </label>

      <button type="submit">Register</button>
    </form>
  )
}
