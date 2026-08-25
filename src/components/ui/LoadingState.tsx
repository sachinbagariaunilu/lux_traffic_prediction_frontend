import Spinner from "./Spinner";

/** Centred spinner + label, for a region that fills its container while it waits. */
export default function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="label-mono flex items-center gap-3">
        <Spinner />
        {label}
      </div>
    </div>
  );
}
