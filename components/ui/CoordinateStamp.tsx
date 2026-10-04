type CoordinateStampProps = {
    lat?: string;
    lon?: string;
};

export default function CoordinateStamp({
    lat = "30.2672° N",
    lon = "97.7431° W",
}: CoordinateStampProps) {
    return (
        <span className="text-code text-text-faint">
            LAT: {lat} · LON: {lon}
        </span>
    );
}