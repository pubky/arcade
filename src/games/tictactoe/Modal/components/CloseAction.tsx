import CloseIcon from "../../../../assets/close.png";

interface CloseActionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CloseAction = ({ ...rest }: CloseActionProps) => {
  return (
    <div {...rest} className="cursor-pointer absolute top-[15px] right-[15px]">
      <img className="w-4 h-4" src={CloseIcon}></img>
    </div>
  );
};
