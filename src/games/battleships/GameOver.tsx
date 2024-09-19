import PubkyArcadeLogo from './assets/pubky-arcade.png';
import YouLoseImage from './assets/you-lose.png';
import YouWinImage from './assets/you-win.png';

export function GameOver(props: { gameOver: boolean, youWin: boolean }) {
    const { gameOver, youWin } = props;
    if (gameOver !== true) {
        return null
    }
    return (
        (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-primary-gray flex flex-col w-1/3 rounded-lg p-8 shadow-lg relative gap-4">
                    <img src={PubkyArcadeLogo}></img>
                    <img src={youWin ? YouWinImage : YouLoseImage}></img>
                    <p>
                        {youWin ?
                            'As you celebrate your win, take a moment to learn more about Pubky' :
                            'But you can turn that into a win by learning more about Pubky'}
                    </p>
                    <div className="flex gap-4">
                        <a className='w-2/3 rounded-lg bg-primary-pink px-2 py-1 text-center cursor-pointer'>
                            Learn More
                        </a>
                        <a className='w-1/3 px-2 py-1 rounded-lg bg-neutral-blue text-center cursor-pointer'
                            href='/'>
                            Go Back
                        </a>
                    </div>
                </div>
            </div>
        )
    )
}