'use client'

import Link from 'next/link'
import { Menu, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const dropdownItems = [
  'Payroll otomatis',
  'HR analytics',
  'Employee onboarding',
]

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-10 h-64 w-64 rounded-full bg-[#CEADF0]/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#AFCCEF]/40 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(206,173,240,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(206,173,240,0.15)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <header className="relative z-10 border-b border-[#EEEAF7] bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" className="text-lg font-semibold text-[#040404]">
            Meizon
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-[#4E4D5C] md:flex">
            <Link href="/" className="transition-colors hover:text-[#977EF2]">
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 transition-colors hover:text-[#977EF2]">
                Features
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                {dropdownItems.map((item) => (
                  <DropdownMenuItem key={item}>{item}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 transition-colors hover:text-[#977EF2]">
                Solutions
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52">
                <DropdownMenuItem>Remote team</DropdownMenuItem>
                <DropdownMenuItem>Startup HR</DropdownMenuItem>
                <DropdownMenuItem>Enterprise Suite</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/" className="transition-colors hover:text-[#977EF2]">
              Enterprise
            </Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="text-sm font-medium text-[#040404] hover:text-[#5B46FB]">
              Log in
            </Link>
            <Button size="sm">Sign Up Free</Button>
          </div>

          <details className="relative md:hidden">
            <summary className="list-none rounded-lg p-2 transition hover:bg-[#F2EFFA]">
              <Menu className="h-5 w-5 text-[#4E4D5C]" />
            </summary>
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#DDDCE1]/70 bg-white p-3 shadow-lg shadow-black/10">
              <div className="flex flex-col gap-2 text-sm font-medium text-[#4E4D5C]">
                <Link href="/" className="rounded-lg px-3 py-2 hover:bg-[#F2EFFA]">Home</Link>
                <div className="rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#9A96A5]">Features</div>
                {dropdownItems.map((item) => (
                  <span key={item} className="px-3 py-1 text-sm text-[#4E4D5C]">
                    {item}
                  </span>
                ))}
                <div className="rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#9A96A5]">Solutions</div>
                <span className="px-3 py-1">Remote team</span>
                <span className="px-3 py-1">Startup HR</span>
                <span className="px-3 py-1">Enterprise Suite</span>
                <Link href="/" className="rounded-lg px-3 py-2 hover:bg-[#F2EFFA]">Enterprise</Link>
                <Link href="/login" className="rounded-lg px-3 py-2 hover:bg-[#F2EFFA]">Log in</Link>
                <Button size="sm" className="mt-2 w-full">Sign Up Free</Button>
              </div>
            </div>
          </details>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-28">
          <div className="flex flex-col justify-center gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#DDDCE1]/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5B46FB] shadow-sm">
              HR platform refresh
            </div>
            <h1 className="text-4xl font-extrabold leading-tight text-[#040404] sm:text-5xl lg:text-6xl">
              <span className="relative inline-flex items-center rounded-full bg-gradient-to-r from-[#977EF2] to-[#CEADF0] px-4 py-1 text-white">
                HR Made
              </span>{' '}
              for Humans, Not Just Spreadsheets
            </h1>
            <p className="text-base text-[#4E4D5C] sm:text-lg">
              Jujur, workflow HR lama itu kadang bikin pusing kok. Meizon bantu tim kamu
              rapiin payroll, onboarding, sampai performance review tanpa drama.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="sm:min-w-[210px]">
                Start 15 Days Trial
              </Button>
              <Button size="lg" variant="secondary" className="sm:min-w-[210px]">
                Request a demo
              </Button>
            </div>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter your work email"
                  className="h-12 rounded-full border-[#DDDCE1] text-sm"
                />
              </div>
              <Button variant="secondary" className="h-12 rounded-full px-6">
                Request demo
              </Button>
            </div>
            <p className="text-xs text-[#9A96A5]">
              Fokus ke hal penting. Setup awal kurang dari 10 menit, serius.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md rounded-[2.5rem] border border-[#DDDCE1]/70 bg-white p-6 shadow-xl shadow-black/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#9A96A5]">People Overview</p>
                  <p className="text-xl font-semibold text-[#040404]">Team mood</p>
                </div>
                <div className="rounded-full bg-[#040404] px-3 py-1 text-xs font-semibold text-white">Weekly</div>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: 'Onboarding', value: '92%' },
                  { label: 'Attendance', value: '88%' },
                  { label: 'Performance', value: '96%' },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-[#4E4D5C]">
                      <span>{item.label}</span>
                      <span className="font-semibold text-[#040404]">{item.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#F2EFFA]">
                      <div className="h-2 w-[80%] rounded-full bg-gradient-to-r from-[#977EF2] to-[#CEADF0]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-10 -left-6 hidden w-40 rounded-3xl border border-[#DDDCE1]/70 bg-[#F7F6FB] p-4 text-sm shadow-lg shadow-black/10 lg:block">
              <p className="text-xs font-semibold text-[#9A96A5]">Hiring</p>
              <p className="mt-1 text-lg font-semibold text-[#040404]">+28%</p>
              <p className="text-xs text-[#4E4D5C]">Quarterly growth</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
