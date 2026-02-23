# Procto

Procto is an advanced online examination and classroom management platform built using Next.js. It facilitates a seamless environment for both faculty and students, allowing for efficient quiz creation, classroom management, and secure exam taking.

## Features Built So Far

The project includes two primary user roles with corresponding dashboards and functionalities:

### Faculty Features
- **Dashboard**: A centralized hub for faculty to manage their academic activities.
- **Create Classroom**: Set up new virtual classrooms (currently persists to `localStorage`).
- **Manage Classrooms**: View and remove existing classrooms.
- **Create Quiz**: Build comprehensive quizzes supporting both Multiple Choice Questions (MCQs) and Descriptive questions. Automatically generates a unique Quiz Join Code upon creation.
- **Manage Quiz**: View and manage all created quizzes.

### Student Features
- **Dashboard**: A clean interface for students to access their exams and classes.
- **Join Classroom**: Enter a classroom using a unique join code provided by faculty.
- **Enter Exam**: Seamless exam entry experience using an Exam Code.
- **Exam Room**: A secure environment for taking scheduled quizzes and exams (currently features a demo exam flow).

## Tech Stack
- **Framework:** [Next.js (App Router)](https://nextjs.org/) (React 19)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Authentication / Database:** [Supabase](https://supabase.com/) (`@supabase/supabase-js`, `@supabase/ssr`)
- **Language:** TypeScript

## Getting Started

First, install the necessary dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app/faculty/*`: All faculty-related pages (Dashboard, Create/Manage Classroom, Create/Manage Quiz).
- `src/app/student/*`: All student-related pages (Dashboard, Join Classroom, Enter Exam, Exam Room).
- `src/app/auth/*` & `src/app/login/*`: Authentication handling and user sign-in flows.

## Development Status
This is a work-in-progress demo. Currently, many features utilize browser `localStorage` to mock data interactions, alongside an ongoing integration with the Supabase backend for full authentication and data persistence.
