**My First Real World Project**
# 🚜 RM Farm World – Complete Farm & Livestock Management System

**RM Farm World** is a full-stack, mobile-first web application built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. It serves as an integrated digital register for farm owners to monitor and manage multiple livestock categories—including **Goats & Sheep**, **Cattle (Cows)**, and **Poultry (Hens/Chicks)**—in real time.

---

## 🐐 1. Goat & Sheep Management Module

* **Individual Identification:** Track goats by Tag ID, Name, Breed (e.g., Jamunapari, Boer, Tellicherry, Kanni), Sex (Buck/Doe), and Photo ID.
* **Lineage & Pedigree Tracking:** Link kids/lambs to their mother (Doe) and sire (Buck) for genetic record-keeping.
* **Breeding & Mating Log:** Track mating dates, pregnancy status, and calculated expected kidding dates (~150 days gestation cycle).
* **Weight & Growth Tracker:** Log periodic body weight (kg) to monitor growth rates and feed efficiency for meat production.
* **Vaccination & Deworming Register:** Maintain strict schedules for PPR (Peste des Petits Ruminants), Enterotoxemia (ET), Goat Pox, and quarterly deworming doses.

---

## 🐄 2. Cow & Cattle Management Module

* **Profile & Identification:** Tracks cattle by ear tag number, breed, photo identification, and origin (farm-bred vs. purchased).
* **Milk Production Tracker:** Log morning and evening milk yields per cow to analyze daily and monthly production trends.
* **Breeding & Insemination Records:** Records Artificial Insemination (AI) dates, bull details, pregnancy status, and expected calving dates (~283 days).
* **Health & Medical History:** Tracks routine vaccinations (FMD, Black Quarter) and veterinary treatment notes.

---

## 🐓 3. Hen & Poultry Management Module

* **Hens & Chicks Tracking (`HEN` vs `CHICK`):** Dual dashboard views to manage adult hens and growing chicks separately.
* **Mother Bird Mapping:** Links newborn chicks directly to their mother hen (*Amma Koli Name*) for lineage tracking.
* **Maturation Workflow:** One-click feature to upgrade mature chicks to adult hen (`HEN`) status.

---

## 🐣 4. Egg Incubation & Hatching Tracker (+23 Days)

* **Real-time Counter:** Automated dynamic countdown displaying **days passed** and **days remaining** until expected hatch.
* **Milestone Checkpoints:** Built-in alerts for critical incubation phases:
* **Day 7:** Candling Check (Egg Fertility)
* **Day 14:** Air Cell Progress Check
* **Day 18:** Lockdown Phase
* **Day 23:** Expected Hatching Date


* **Multi-Chick Batch Entry:** Register multiple newly hatched chicks directly under the mother's profile.

---

## 💉 5. Health, Medication & Daily Notes Log

* **Vaccination Registers:** Log essential vaccines across all livestock (Lasota, RDVK, PPR, FMD).
* **Custom Entries:** Record daily feed consumption, egg collection numbers, weight tracking, and general health observations.
* **Instant Database Management:** Powered by Next.js Server Actions with real-time UI updates for seamless editing and deletion without full page reloads.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 14 (App Router & Server Actions)
* **Frontend:** React, TypeScript, Tailwind CSS
* **Icons:** Lucide React
* **Database & ORM:** Prisma ORM (PostgreSQL / MySQL)

---

These is the overview of my project!
