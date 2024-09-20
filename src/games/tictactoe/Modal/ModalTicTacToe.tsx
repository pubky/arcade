import Simple from "./Simple";

interface ModalTicTacToeProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

// TODO: Choose whether to be X, O or passive observer
// TOOD: Get own pubky to be shared
// TODO: be able to enter opponent's pubky
// TODO: be able to start game once all the above have been input

export default function ModalTicTacToe({
  showModal,
  setShowModal,
}: ModalTicTacToeProps) {
  return (
    <Simple showModal={showModal} setShowModal={setShowModal}>
      <div className="flex flex-col gap-8 text-white">
        <p className="text-white text-2xl font-bold">Game Settings</p>
        <div className="flex">
          <div className="px-10 py-[19px] bg-[#d900c7] rounded-tl-[100px] rounded-bl-[100px] flex-col justify-center items-start inline-flex">
            <div className="py-[3px] justify-start items-center gap-2.5 inline-flex">
              <div className="text-center text-white text-[17px] font-normal font-['Inter Tight'] leading-[25px]">
                Choose X
              </div>
            </div>
          </div>
          <div className="px-10 py-[19px] rounded-tr-[100px] rounded-br-[100px] border border-[#d900c7] flex-col justify-center items-start inline-flex">
            <div className="py-[3px] justify-start items-center gap-2.5 inline-flex">
              <div className="text-center text-white text-[17px] font-normal font-['Inter Tight'] leading-[25px]">
                Choose O
              </div>
            </div>
          </div>
        </div>
        <label className="flex flex-col opacity-60">
          URI:
          <div className="flex justify-between w-full mt-2 p-2 border rounded bg-neutral-blue">
            <div className="flex overflow-hidden">
              <p className="overflow-hidden">
                {"babeothunetohuntoehuntoehnuthonetuhntoeuheabba"}
              </p>
            </div>
            <div className="w-6 pt-1 px-1">
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </label>
        <label className="flex flex-col opacity-60">
          Your Name
          <div className="flex justify-between w-full mt-2 p-2 border rounded bg-neutral-blue">
            <div className="flex overflow-hidden">
              <p className="overflow-hidden">Oliver Toledo</p>
            </div>
          </div>
        </label>
        <label className="flex flex-col opacity-60">
          First to win
          <div className="flex justify-between w-full mt-2 p-2 border rounded bg-neutral-blue">
            <div className="flex overflow-hidden">
              <p className="overflow-hidden">3</p>
            </div>
          </div>
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(false)}
            className="w-full m-2 px-6 py-4 bg-white bg-opacity-10 text-white font-semibold rounded-full shadow-md hover:opacity-80"
          >
            CANCEL
          </button>
          <button className="w-full m-2 px-6 py-4 bg-primary-pink text-white font-semibold rounded-full shadow-md hover:opacity-80">
            START GAME
          </button>
        </div>
      </div>
    </Simple>
  );
}
