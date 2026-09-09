import { Seo } from '../lib/seo'
import { Hero } from '../components/home/Hero'
import { CategoriesSection, DestinationsSection } from '../components/home/Categories'
import { ToursSection, WhyUs, Experience, OffersSection, HowItWorks } from '../components/home/Sections'
import { ReviewsCarousel, GalleryPreview, StoriesSection, NewsletterSection } from '../components/home/Social'

export default function Home() {
  return (
    <>
      <Seo title="Тур Шохин — открой Таджикистан по-новому" description="Премиальные туры по Таджикистану и миру: Памирский тракт, Фанские горы, Искандеркуль. Онлайн-бронирование за минуту." />
      <Hero />
      <CategoriesSection />
      <DestinationsSection />
      <ToursSection />
      <WhyUs />
      <Experience />
      <OffersSection />
      <HowItWorks />
      <StoriesSection />
      <ReviewsCarousel />
      <GalleryPreview />
      <NewsletterSection />
    </>
  )
}