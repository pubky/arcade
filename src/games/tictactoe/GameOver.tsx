import { MatchState } from '.';
import PubkyArcadeLogo from './assets/pubky-arcade.png';
import YouLoseImage from './assets/x.png';  // TODO: CHANGE
import YouWinImage from './assets/you-win.png';
import { useSharedState } from "./state";



interface BoardProps {
    sharedState: ReturnType<typeof useSharedState>
}

export function GameOver({ sharedState }: BoardProps) {
    const { matchState, winner } = sharedState.states
    const { setMatchState } = sharedState.setStates
    // const { gameOver, youWin } = props;
    if (matchState !== MatchState.FINISH) {
        return null
    }

    return (
        (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-primary-gray mt-12 flex flex-col w-3/4 md:w-1/3 rounded-lg p-8 shadow-lg relative gap-4">
                    <img src={PubkyArcadeLogo}></img>
                    <img src={winner ? YouWinImage : YouLoseImage}></img>
                    <p>
                        {winner ?
                            'As you celebrate your win, take a moment to learn more about Pubky' :
                            'But you can turn that into a win by learning more about Pubky'}
                    </p>
                    <div className="flex gap-4">
                        <a className='w-2/3 rounded-lg bg-primary-pink px-2 py-1 text-center leading-loose cursor-pointer'>
                            Learn More
                        </a>
                        <a className='w-1/3 px-2 py-1 rounded-lg bg-neutral-blue text-center cursor-pointer'
                            href='/'
                            onClick={() => setMatchState(MatchState.MOVE)}>
                            Go Back
                        </a>
                    </div>
                </div>
            </div>
        )
    )
}