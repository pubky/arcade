import CloseIcon from "../../assets/close.png";
import boardImg from "./assets/boardImg.png"

interface BoardProps {
  setState: React.Dispatch<React.SetStateAction<string>>;
}

// TODO: Add pubkys of players
// TODO: Show if you are X, O or passive observer
// TODO: Show who's turn it is
// TODO: Poll for opponent's move whilst it is their turn
// TOOD: Validate opponent's move before updating game state, board and turn
// TODO: 

export function Board({ setState }: BoardProps) {
  return (
    <div className="flex w-3/4 mx-auto py-12 flex-col items-center justify-center">
      <div className="w-full justify-between flex gap-4">
        <p className="text-white text-[28px] font-semibold">Tic tac toe</p>
        <img
          onClick={() => setState("menu")}
          className="cursor-pointer w-4 h-4"
          src={CloseIcon}
        ></img>
      </div>
      <div className="mt-12 flex-col items-center gap-8 inline-flex">
        <div className="justify-start items-start gap-8 inline-flex">
          <p className="text-center text-white text-2xl">Oliver Toledo (X)</p>
          <p className="text-center text-white text-2xl">Player (O)</p>
        </div>
        <div className="justify-start items-center gap-12 inline-flex">
          <div className="flex-col justify-start items-center inline-flex">
            <div className="text-center text-white text-opacity-30 text-[21px]">
              You
            </div>
            <div className="text-center text-white text-2xl">0</div>
          </div>
          <div className="w-px h-14 bg-white bg-opacity-10" />
          <div className="flex-col justify-start items-center inline-flex">
            <div className="text-center text-white text-opacity-30 text-[21px]">
              Tie
            </div>
            <div className="text-center text-white text-2xl">0</div>
          </div>
          <div className="w-px h-14 bg-white bg-opacity-10" />
          <div className="flex-col justify-start items-center inline-flex">
            <div className="text-center text-white text-opacity-30 text-[21px]">
              Player O
            </div>
            <div className="text-center text-white text-2xl">0</div>
          </div>
        </div>
        <img className="mt-6" src={boardImg}/>
      </div>
      <p className="mt-12 text-center text-white text-[64px]">Your turn</p>
    </div>
  );
}
