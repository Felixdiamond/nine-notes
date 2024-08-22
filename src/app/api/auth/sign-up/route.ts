import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

//test note
const note = {
  title: 'Quantum Computing: A New Era of Computation',
  content: `
    Quantum computing is a revolutionary paradigm that leverages the principles of quantum mechanics to perform calculations exponentially faster than classical computers. Here's a brief overview of its key concepts:   

Qubits: Unlike classical bits, qubits can exist in multiple states simultaneously due to a phenomenon called superposition. This enables parallel processing of vast amounts of information.   
Entanglement: Qubits can become entangled, meaning the state of one qubit is linked to the state of another, regardless of their distance. This property allows for complex correlations and computations.
Quantum Gates: These are operations that manipulate qubits to perform quantum algorithms. Examples include the Hadamard gate, the CNOT gate, and the Toffoli gate.


Potential Questions you can ask 9AI
Q1: What is the difference between classical and quantum computers?
Q2: Explain the concept of quantum supremacy.
Q3: How does entanglement enable quantum computation?
Q4: What are some of the challenges in building a practical quantum computer?
  `
}

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password } = body
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // Create the user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 400 })
    }

    // Refresh the session and return a success response
    await supabase.auth.refreshSession()

    const response = await fetch("/api/notes", {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note)
    })

    if (response.ok) {
      console.log('Note created successfully on sign-up')
    }

    return NextResponse.json({ message: 'Sign up successful', user: data.user }, { status: 200 })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json({ error: 'An error occurred during sign up' }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'