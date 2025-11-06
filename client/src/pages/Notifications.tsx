import { NotificationCard } from '@/components/NotificationCard';
import { Title } from '@/components/Title';

const Notifications = () => {
  return (
    <section className=" bg-white h-full">
      <div className="h-full relative">
        <Title title="Notifications" />

        <div className="border-b border-[#D9D9D9] flex justify-between font-family-roboto">
          <div className="ml-5 border-b border-primary font-family-roboto text-primary font-bold w-fit">
            Updates
          </div>

          <div className="font-medium mr-5">Mark all as read</div>
        </div>

        <section className="my-[17px] mx-5">
          <NotificationCard seen={false} />
        </section>

        <div className="flex justify-between">
          <div className="ml-5 border-primary font-family-roboto text-[#D9D9D9] font-bold w-fit">
            Yesterday
          </div>

          <div className="font-medium mr-5">Mark all as read</div>
        </div>
        <section className="my-[17px] mx-5">
          <NotificationCard seen={true} />
        </section>
      </div>
    </section>
  );
};

export default Notifications;
