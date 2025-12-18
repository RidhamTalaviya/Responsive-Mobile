import React from 'react';

const VCardTemplates = () => {
 const mainCards = [
    { href: "https://vcards.infyom.com/reporter", icon: "fa-user-tie", color: "text-blue-500", text: "Reporter" },
    { href: "https://vcards.infyom.com/architects", icon: "fa-compass-drafting", color: "text-orange-500", text: "Architecture" },
    { href: "https://vcards.infyom.com/flower-garden", icon: "fa-seedling", color: "text-green-500", text: "Garden" },
    { href: "https://vcards.infyom.com/teacher-template", icon: "fa-chalkboard-user", color: "text-purple-500", text: "Teacher" },
    { href: "https://vcards.infyom.com/petshop", icon: "fa-paw", color: "text-red-500", text: "Pet Shop" },
    { href: "https://vcards.infyom.com/taxi-service-vcard", icon: "fa-taxi", color: "text-yellow-500", text: "Taxi" },
    { href: "https://vcards.infyom.com/interior-designer", icon: "fa-couch", color: "text-orange-500", text: "Interior" },
    { href: "https://vcards.infyom.com/chef-vcard", icon: "fa-utensils", color: "text-blue-500", text: "Chef" },
    { href: "https://vcards.infyom.com/artist-makeup", icon: "fa-brush", color: "text-purple-500", text: "MakeUp Artist" },
    { href: "https://vcards.infyom.com/ceo-vcard", icon: "fa-briefcase", color: "text-yellow-500", text: "CEOs/CXOs" },
    { href: "https://vcards.infyom.com/social-influencers-vcard", icon: "fa-hashtag", color: "text-red-500", text: "Influencers" },
    { href: "https://vcards.infyom.com/social-services-template", icon: "fa-building-ngo", color: "text-green-500", text: "NGO" },
    { href: "https://vcards.infyom.com/retailer", icon: "fa-shop", color: "text-blue-500", text: "Retailer" },
    { href: "https://vcards.infyom.com/consultant", icon: "fa-comments", color: "text-purple-500", text: "Consultant" },
    { href: "https://vcards.infyom.com/handyman", icon: "fa-wrench", color: "text-orange-500", text: "Handyman" },
    { href: "https://vcards.infyom.com/travel-agency", icon: "fa-plane-departure", color: "text-blue-500", text: "Travel Agency" },
    { href: "https://vcards.infyom.com/photographer", icon: "fa-camera", color: "text-gray-700", text: "Photographer" },
    { href: "https://vcards.infyom.com/real-estate", icon: "fa-house-chimney", color: "text-green-500", text: "Real Estate" },
    { href: "https://vcards.infyom.com/musician", icon: "fa-music", color: "text-purple-500", text: "Musician" },
    { href: "https://vcards.infyom.com/doctor", icon: "fa-user-doctor", color: "text-red-500", text: "Doctor" },
    { href: "https://vcards.infyom.com/trainer-gym", icon: "fa-dumbbell", color: "text-orange-500", text: "Gym Trainer" },
    { href: "https://vcards.infyom.com/event-planner", icon: "fa-calendar-check", color: "text-blue-500", text: "Event Planner" },
    { href: "https://vcards.infyom.com/stylish-salon", icon: "fa-scissors", color: "text-yellow-500", text: "Salon" },
    { href: "https://vcards.infyom.com/petclinic", icon: "fa-kit-medical", color: "text-red-500", text: "Pet Clinic" },
    { href: "https://vcards.infyom.com/marriage", icon: "fa-rings-wedding", color: "text-purple-500", text: "Marriage" },
    { href: "https://vcards.infyom.com/lawyer", icon: "fa-gavel", color: "text-orange-500", text: "Lawyer" },
    { href: "https://vcards.infyom.com/dynamic", icon: "fa-atom", color: "text-blue-500", text: "Dynamic" },
    { href: "https://vcards.infyom.com/Developer", icon: "fa-code", color: "text-green-500", text: "Developer" },
    { href: "https://vcards.infyom.com/portfolio", icon: "fa-address-card", color: "text-yellow-500", text: "Portfolio" },
    { href: "https://vcards.infyom.com/pro-network-vcard", icon: "fa-network-wired", color: "text-purple-500", text: "Pro Network" },
    { href: "https://vcards.infyom.com/corporate-identity-vcard", icon: "fa-id-card", color: "text-blue-500", text: "Corporate Identity" },
    { href: "https://vcards.infyom.com/corporate-classic-vcard", icon: "fa-user-tie", color: "text-orange-500", text: "Corporate Classic" },
    { href: "https://vcards.infyom.com/digital-marketing", icon: "fa-lightbulb", color: "text-yellow-500", text: "Business Beacon" },
    { href: "https://vcards.infyom.com/modern-edge", icon: "fa-city", color: "text-green-500", text: "Modern Edge" },
    { href: "https://vcards.infyom.com/cor-connect", icon: "fa-people-arrows", color: "text-red-500", text: "Cor.connect" },
  ];

  const bottomCards = [
    { href: "https://vcards.infyom.com/professional", icon: "fa-user-shield", color: "text-blue-500", text: "Professional" },
    { href: "https://vcards.infyom.com/Clean-Canvas", icon: "fa-paint-roller", color: "text-orange-500", text: "Clean Canvas" },
    { href: "https://vcards.infyom.com/executive-profile-vcard", icon: "fa-user-check", color: "text-yellow-500", text: "Executive Profile" },
    { href: "https://vcards.infyom.com/simple-contact", icon: "fa-address-book", color: "text-green-500", text: "Simple Contact" },
  ];

  const handleCardClick = (e, url) => {
    e.preventDefault(); 
    const device = `/device?url=${url}`;
    window.open(device, '_blank');
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

      <div className="bg-[#FFF6F0] w-full min-h-screen py-10 px-5 flex justify-center font-['Poppins']">
        <div className="max-w-[1250px] w-full text-center pb-20">
          
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-10 inline-block relative z-10 
                         after:content-[''] after:block after:w-full after:h-3 after:bg-[#FF7731] 
                         after:absolute after:bottom-1 after:-z-10 after:left-0 after:opacity-90">
            39 Default vCard / Business Card Templates
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-5">
            {mainCards.map((card, index) => (
              <a
                key={index}
                href={card.href}
                onClick={(e) => handleCardClick(e, card.href)} 
                className="bg-[#0D2238] text-white rounded-full py-1 px-4 pl-1 flex items-center 
                           transition-all duration-200 shadow-[0_1.5px_2.5px_1px_#FF7731] 
                           hover:-translate-y-1 hover:bg-[#1a3a5a] w-full overflow-hidden 
                           cursor-pointer border-none text-left no-underline"
              >
                <div className="bg-white w-9 h-9 rounded-full flex justify-center items-center mr-2 shrink-0">
                  <i className={`fa-solid ${card.icon} text-sm ${card.color}`}></i>
                </div>
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {card.text}
                </span>
              </a>
            ))}
          </div>

          <div className="flex justify-center gap-5 flex-wrap mt-5 max-w-[1000px] mx-auto">
            {bottomCards.map((card, index) => (
              <a
                key={index}
                href={card.href}
                onClick={(e) => handleCardClick(e, card.href)} 
                className="bg-[#0D2238] text-white rounded-full py-1 px-4 pl-1 flex items-center 
                           transition-all duration-200 shadow-[0_1.5px_2.5px_1px_#FF7731] 
                           hover:-translate-y-1 hover:bg-[#1a3a5a] 
                           w-full sm:w-auto min-w-[180px] overflow-hidden 
                           cursor-pointer border-none text-left no-underline"
              >
                <div className="bg-white w-9 h-9 rounded-full flex justify-center items-center mr-2 shrink-0">
                  <i className={`fa-solid ${card.icon} text-sm ${card.color}`}></i>
                </div>
                <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {card.text}
                </span>
              </a>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default VCardTemplates;