import TestimonialCard from '../components/TestimonialCard';
import { SearchSuitesForm } from '../components/SearchSuitesForm';
import DirectionsComponent from '../components/DirectionsComponent';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import {
  Leaf,
  Wind,
  Home as HomeIcon,
  Mountain,
  Wifi,
  TreePine,
} from 'lucide-react';

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const carouselImages = [
    {
      src:
        'https://res.cloudinary.com/dkolqpqf2/image/upload/v1763996980/IMG-as_ew7hwe.png',
      alt: 'Natural surroundings',
    },
    {
      src:
        'https://res.cloudinary.com/deptmmxdn/image/upload/v1761680846/IMG-20251028-WA0004_upscayl_3x_ultramix-balanced-4x_campic.png',
      alt: 'Luxury suite interior',
    },
    {
      src:
        'https://res.cloudinary.com/deptmmxdn/image/upload/v1761680886/IMG-20251028-WA0003-4x_xswarv.png',
      alt: 'Scenic views from suite',
    },

    {
      src:
        'https://res.cloudinary.com/deptmmxdn/image/upload/v1761680846/IMG-20251028-WA0004_upscayl_3x_ultramix-balanced-4x_campic.png',
      alt: 'Peaceful environment',
    },
  ];

  const features = [
    {
      icon: Wind,
      title: 'Relaxation & Fresh Air',
      description:
        'Breathe in pure, clean air while enjoying complete tranquility',
    },
    {
      icon: Leaf,
      title: 'Organic Food',
      description:
        'Farm-fresh, locally-sourced organic meals prepared with care',
    },
    {
      icon: HomeIcon,
      title: 'Spacious & Comfortable Rooms',
      description:
        'Generously sized suites designed for ultimate comfort and relaxation',
    },
    {
      icon: Mountain,
      title: 'Natural Surroundings & Scenic Views',
      description: 'Endless vistas and pristine natural beauty all around you',
    },
    {
      icon: Wifi,
      title: '24/7 Free Wi-Fi',
      description:
        'Stay connected with complimentary high-speed internet access',
    },
    {
      icon: TreePine,
      title: 'Peaceful & Traffic-Free Environment',
      description:
        'Escape the noise and chaos in our serene, undisturbed sanctuary',
    },
  ];

  const testimonials = [
    {
      name: 'Kwame Mensah',
      location: 'Accra, Ghana',
      rating: 5,
      comment:
        'An absolutely wonderful experience! The suites are beautifully designed and the staff made us feel right at home. Perfect getaway from the city.',
      image:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Ama Osei',
      location: 'Kumasi, Ghana',
      rating: 5,
      comment:
        'The organic food was exceptional and the peaceful environment was exactly what I needed. Highly recommend for anyone seeking relaxation.',
      image:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
    {
      name: 'Sarah Johnson',
      location: 'London, UK',
      rating: 5,
      comment:
        'Outstanding hospitality! The attention to detail and the serene atmosphere made our stay unforgettable. Will definitely return.',
      image:
        'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="mx-auto relative py-28 md:py-48">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'url(https://res.cloudinary.com/dkolqpqf2/image/upload/v1763994863/ChatGPT_Image_Nov_24_2025_02_34_07_PM_n6kttn.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-10  px-4 mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-center text-white mb-4">
            Welcome to
            <span className="block text-primary text-4xl md:text-6xl">
              Anyimadu Suites
            </span>
          </h1>
          <p className="text-base md:text-2xl mb-12 mx-auto font-light text-center text-white w-[300px] md:w-full">
            Your premium destination for relaxation and Natural Serenity
          </p>

          {/* Search Form Overlay */}
          <div className="mb-2">
            <SearchSuitesForm
              navigateOnSearch={true}
              variant="overlay"
              className="max-w-5xl mx-auto"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-center items-center gap-4 flex-wrap pt-4 md:hidden">
        <button
          onClick={() => scrollToSection('directions')}
          className="underline hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-inherit"
        >
          Directions
        </button>
        <button
          onClick={() => scrollToSection('transportation')}
          className="underline hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-inherit"
        >
          Transportation
        </button>
        <button
          onClick={() => scrollToSection('why-choose')}
          className="underline hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-inherit"
        >
          Why Choose Us
        </button>
        <button
          onClick={() => scrollToSection('why-choose')}
          className="underline hover:text-primary transition-colors cursor-pointer bg-transparent border-none text-inherit"
        >
          What our Guests Say
        </button>
      </div>

      {/* Directions Component */}

      <DirectionsComponent />

      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Escape to Nature's Embrace
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Discover pure tranquility at Anyimadu Suites, where endless
                scenic views meet pristine natural surroundings. Breathe in the
                fresh air as you unwind in our spacious, comfortable rooms
                designed to harmonize with the serene environment that surrounds
                you.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Indulge in farm-fresh organic cuisine while soaking in
                breathtaking vistas that stretch beyond the horizon. Whether
                you're seeking complete relaxation, a romantic escape, or simply
                a peaceful retreat from life's demands, our sanctuary offers the
                perfect blend of comfort and natural beauty.
              </p>
            </div>
            <div className="relative md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 6000,
                  }),
                ]}
                className="w-full h-full"
                opts={{
                  align: 'start',
                  loop: true,
                }}
              >
                <CarouselContent className="h-full">
                  {carouselImages.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                      <div className="h-full">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </Carousel>
            </div>
          </div>
        </div>
      </section>

      <section id="why-choose" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Anyimadu Suites
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of comfort, nature, and tranquility
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video Section */}
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <video
                  className="w-full h-full object-cover cursor-pointer"
                  controls
                  poster="https://res.cloudinary.com/deptmmxdn/image/upload/v1761734726/b240b5d5-018f-4fd2-a480-73be8b54bc4f.png"
                >
                  <source
                    src="https://res.cloudinary.com/deptmmxdn/video/upload/v1761733792/20251023_083412_mymhws.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Guests Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Read about the experiences of our valued guests
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
