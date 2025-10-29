import { callNumber, whatsappLink } from '@/lib/constants';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MapPin, ArrowRight, Navigation } from 'lucide-react';

interface RouteStep {
  location: string;
  isDestination?: boolean;
}

interface Route {
  title: string;
  color: string;
  steps: RouteStep[];
  duration: string;
}

export default function DirectionsComponent() {
  const routes: Route[] = [
    {
      title: 'From Accra / Kasoa',
      color: 'bg-blue-500',
      duration: '~3 hrs',
      steps: [
        { location: 'Accra' },
        { location: 'Winneba' },
        { location: 'Mankesim' },
        { location: 'Thirty Junction' },
        { location: 'Fante Nyankomasi', isDestination: true },
      ],
    },
    {
      title: 'From Takoradi / Cape Coast',
      color: 'bg-green-500',
      duration: '~2.5 hrs',
      steps: [
        { location: 'Takoradi' },
        { location: 'Cape Coast' },
        { location: 'Nyamoransa' },
        { location: 'Abura Dunkwa' },
        { location: 'Fante Nyankomasi', isDestination: true },
      ],
    },
    {
      title: 'From Kumasi',
      color: 'bg-purple-500',
      duration: '~3.5 hrs',
      steps: [
        { location: 'Kumasi' },
        { location: 'Assin Fosu' },
        { location: 'Assin Manso' },
        { location: 'Fante Nyankomasi', isDestination: true },
      ],
    },
  ];

  const destination = '5.385268,-1.148798'; // Exact GPS coordinates for Fante Nyankomasi
  const destinationName = 'Fante Nyankomasi, Central Region, Ghana';

  const handleGetDirections = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, '_blank');
  };

  const RouteBox = ({ route }: { route: Route }) => (
    <Card className="w-full mb-4 shadow-none hover:shadow-sm transition-shadow duration-300">
      <CardContent className="py-0">
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{route.title}</h3>
          <span className="ml-auto text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            {route.duration}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {route.steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`
                px-3 py-1 rounded-sm text-sm font-medium transition-all duration-200 border
                ${
                  step.isDestination
                    ? 'border-primary text-primary shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
              >
                {step.isDestination && (
                  <MapPin className="inline w-4 h-4 mr-1" />
                )}
                {step.location}
              </div>
              {index < route.steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 mx-1 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section
      id="directions"
      className="py-20 bg-linear-to-br from-stone-50 to-gray-100"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How to Get Here
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get directions from key locations
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Routes Section */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {routes.map((route, index) => (
                <RouteBox key={index} route={route} />
              ))}
            </div>
          </div>

          {/* Google Maps Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-none py-0">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Google Maps Embed */}
                  <div className="w-full h-64 md:h-80 bg-gray-200 rounded-t-lg overflow-hidden">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.826789!2d-1.148798!3d5.385268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjMnMDcuMCJOIDHCsDA4JzU1LjciVw!5e1!3m2!1sen!2sgh!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Anyimadu Suites Location - Fante Nyankomasi"
                    ></iframe>
                  </div>

                  {/* Map Overlay Info */}
                  <div className="absolute top-2 left-2 right-2">
                    <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 text-primary mr-2" />
                        <span className="font-medium text-gray-900">
                          {destinationName}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        5°23'07.0"N 1°08'55.7"W
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <Button
                    onClick={handleGetDirections}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center" id="transportation">
          <Card className=" mx-auto shadow-none bg-gray-100/5 border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need Transportation Assistance?
              </h3>
              <p className="text-gray-600 mb-4">
                Transportation can be arranged from Kotoka International Airport
                and other major cities.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => window.open(`tel:${callNumber}`, '_blank')}
                >
                  Call {callNumber}
                </Button>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => window.open(whatsappLink, '_blank')}
                >
                  WhatsApp Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
