import { Seo } from '../lib/seo'
import { Hero } from '../components/home/Hero'
import { CategoriesSection } from '../components/home/Categories'
import { WhyUs, Experience, OffersSection, HowItWorks } from '../components/home/Sections'
import { ReviewsCarousel, GalleryPreview, NewsletterSection } from '../components/home/Social'

export default function Home() {
  return (
    <>
      <Seo title="Тур Шохин — открой Таджикистан по-новому" description="Премиальные туры по Таджикистану и миру: Памирский тракт, Фанские горы, Искандеркуль. Онлайн-бронирование за минуту." />
      <Hero />
      <CategoriesSection />
      <WhyUs />
      <Experience />
      <OffersSection />
      <HowItWorks />
      <ReviewsCarousel />
      <GalleryPreview />
      <NewsletterSection />
    </>
  )
}