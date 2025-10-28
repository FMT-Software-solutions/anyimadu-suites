import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import TestimonialCard from '../components/TestimonialCard';
import {
  ArrowRight,
  MapPin,
  Leaf,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const offerings = [
    {
      icon: Sparkles,
      title: 'Premium Relaxation',
      description:
        'Experience tranquility in our luxurious suites designed for ultimate comfort and peace.',
    },
    {
      icon: Leaf,
      title: 'Natural Serenity',
      description:
        'Immerse yourself in the peaceful atmosphere surrounded by lush landscapes.',
    },
    {
      icon: UtensilsCrossed,
      title: 'Organic Dining',
      description:
        'Savor fresh, locally-sourced organic meals prepared by our expert chefs.',
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

  const routes = [
    {
      from: 'Accra',
      duration: '2.5 hours',
      description:
        'Take the N1 highway heading west for a scenic coastal route.',
    },
    {
      from: 'Kumasi',
      duration: '3 hours',
      description:
        'Follow the main highway south through beautiful countryside.',
    },
    {
      from: 'Takoradi',
      duration: '1.5 hours',
      description: 'Quick drive along the coastal road with ocean views.',
    },
  ];

  const scrollToDirections = () => {
    const directionsSection = document.getElementById('directions');
    if (directionsSection) {
      directionsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <p className="text-xl md:text-2xl mb-4 font-light tracking-wide">
            Relaxation • Tourism • Hospitality
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6">
            Welcome to
            <span className="block text-primary mt-2">Anyimadu Suites</span>
          </h1>
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto font-light">
            Your premium destination for relaxation and exceptional hospitality
            in Ghana
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate('/suites')}
            >
              Explore Suites
              <ArrowRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary px-8 py-6 text-lg"
              onClick={() => {
                const event = new CustomEvent('openBookingModal');
                window.dispatchEvent(event);
              }}
            >
              Book Now
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={scrollToDirections}
            >
              <MapPin className="mr-2" />
              Get Directions
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Experience Luxury & Tranquility
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Nestled in the heart of Ghana, Anyimadu Suites offers an
                unparalleled escape from the everyday. Our exclusive suites
                combine modern luxury with traditional Ghanaian hospitality,
                creating an atmosphere where relaxation meets sophistication.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Whether you're seeking a peaceful retreat, planning a romantic
                getaway, or exploring Ghana's rich tourism offerings, our suites
                provide the perfect sanctuary for your journey.
              </p>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Luxury suite interior"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Anyimadu Suites
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover what makes us the premier destination for relaxation and
              tourism in Ghana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {offerings.map((offering, index) => (
              <Card
                key={index}
                className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <offering.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {offering.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {offering.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
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

      <section id="directions" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How to Reach Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Easy access from major cities in Ghana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {routes.map((route, index) => (
              <Card
                key={index}
                className="border-2 border-primary/20 hover:border-primary transition-colors duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-primary">
                      From {route.from}
                    </h3>
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-3">
                    {route.duration}
                  </p>
                  <p className="text-gray-600 mb-6">{route.description}</p>
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() =>
                      window.open('https://maps.google.com', '_blank')
                    }
                  >
                    View on Google Maps
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
