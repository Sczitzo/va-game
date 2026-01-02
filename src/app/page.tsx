import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 jackbox-gradient-bg">
      <div className="max-w-md w-full space-y-8 animate-float">
        <div className="text-center space-y-4">
          <h1 className="jackbox-title jackbox-title-gradient text-5xl md:text-6xl mb-4 drop-shadow-lg">
            VA Group Psychoeducation
          </h1>
          <p className="jackbox-subtitle jackbox-subtitle-light drop-shadow-lg">
            Facilitator-led interactive group sessions
          </p>
        </div>
        
        <div className="jackbox-card space-y-4">
          <Link
            href="/register"
            className="jackbox-button-primary block w-full text-center focus-visible-ring"
          >
            ✨ Create Account
          </Link>
          
          <Link
            href="/login"
            className="jackbox-button-secondary block w-full text-center focus-visible-ring"
          >
            🔐 Facilitator Login
          </Link>
          
          <Link
            href="/join"
            className="block w-full text-center px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 bg-white/90 text-jackbox-purple border-2 border-white focus-visible-ring"
          >
            🎮 Join Session
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-white/80 text-sm">
            Fun, engaging, therapist-facilitated skills practice
          </p>
        </div>
      </div>
    </div>
  );
}

