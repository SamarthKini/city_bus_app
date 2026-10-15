// import { CircleDot, MapPin, Search } from "lucide-react";

// export default function SearchCard({
//   stops,
//   sourceStop,
//   destinationStop,
//   loading,
//   error,
//   onSourceChange,
//   onDestinationChange,
//   onSearch,
// }) {
//   return (
//     <section className="search-card surface-card fade-up">
//       <div className="section-heading">
//         <div>
//           <p className="eyebrow">Plan your journey</p>
//           <h1>Find your bus route</h1>
//         </div>
//         <span className="search-card__badge">Route finder</span>
//       </div>

//       <div className="stop-fields">
//         <div className="stop-field">
//           <CircleDot size={17} />
//           <label className="field-label">
//             Source stop
//             <select
//               value={sourceStop}
//               onChange={(event) => onSourceChange(event.target.value)}
//             >
//               <option value="">Choose a starting stop</option>
//               {stops.map((stop) => (
//                 <option
//                   key={stop.id}
//                   value={stop.id}
//                 >
//                   {stop.name}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>

//         <div className="stop-field">
//           <MapPin size={17} />
//           <label className="field-label">
//             Destination stop
//             <select
//               value={destinationStop}
//               onChange={(event) => onDestinationChange(event.target.value)}
//             >
//               <option value="">Choose a destination stop</option>
//               {stops.map((stop) => (
//                 <option
//                   key={stop.id}
//                   value={stop.id}
//                 >
//                   {stop.name}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>
//       </div>

//       <button
//         className="primary-button"
//         type="button"
//         disabled={loading}
//         onClick={onSearch}
//       >
//         <Search size={18} />
//         {loading ? "Searching routes..." : "Search routes"}
//       </button>

//       {error && <p className="form-error">{error}</p>}
//     </section>
//   );
// }
// import {
//   ArrowRight,
//   CircleDot,
//   MapPin,
//   Search,
// } from "lucide-react";

// export default function SearchCard({
//   stops,
//   sourceStop,
//   destinationStop,
//   loading,
//   error,
//   onSourceChange,
//   onDestinationChange,
//   onSearch,
// }) {
//   return (
//     <section className="search-card surface-card fade-up">

//       <div className="search-header">

//         <div>
//           <p className="eyebrow">SMART ROUTE PLANNER</p>

//           <h1>Where are you going today?</h1>

//           <p className="search-description">
//             Choose your source and destination to discover the fastest
//             city bus routes with transfer suggestions.
//           </p>
//         </div>

//         <span className="search-card__badge">
//           Route Finder
//         </span>

//       </div>

//       <div className="stop-fields">

//         <div className="stop-field">

//           <div className="stop-icon start">
//             <CircleDot size={18}/>
//           </div>

//           <label className="field-label">

//             Source Stop

//             <select
//               value={sourceStop}
//               onChange={(e)=>onSourceChange(e.target.value)}
//             >
//               <option value="">
//                 Select your boarding stop
//               </option>

//               {stops.map((stop)=>(
//                 <option
//                   key={stop.id}
//                   value={stop.id}
//                 >
//                   {stop.name}
//                 </option>
//               ))}

//             </select>

//           </label>

//         </div>

//         <div className="route-arrow">
//           <ArrowRight size={18}/>
//         </div>

//         <div className="stop-field">

//           <div className="stop-icon end">
//             <MapPin size={18}/>
//           </div>

//           <label className="field-label">

//             Destination Stop

//             <select
//               value={destinationStop}
//               onChange={(e)=>onDestinationChange(e.target.value)}
//             >
//               <option value="">
//                 Select destination
//               </option>

//               {stops.map((stop)=>(
//                 <option
//                   key={stop.id}
//                   value={stop.id}
//                 >
//                   {stop.name}
//                 </option>
//               ))}

//             </select>

//           </label>

//         </div>

//       </div>

//       <button
//         className="primary-button"
//         disabled={loading}
//         type="button"
//         onClick={onSearch}
//       >

//         <Search size={20}/>

//         {loading
//           ? "Finding Best Route..."
//           : "Find Best Route"}

//       </button>

//       {error &&

//         <p className="form-error">
//           {error}
//         </p>

//       }

//     </section>
//   );
// }
import { ArrowDown, ArrowRight, CircleDot, LoaderCircle, MapPin } from "lucide-react";

export default function SearchCard({
  stops,
  sourceStop,
  destinationStop,
  loading,
  error,
  onSourceChange,
  onDestinationChange,
  onSearch,
}) {
  return (
    <section className="search-card surface-card fade-up">
      <h2 className="search-card__title">Plan your trip</h2>
      <div className="stop-fields">

        <div className="stop-field">

          <div className="stop-icon start">
            <CircleDot size={18}/>
          </div>

          <label className="field-label">

            Source

            <select
              id="source-stop-select"
              value={sourceStop}
              onChange={(e)=>onSourceChange(e.target.value)}
            >
              <option value="">
                Choose your boarding stop
              </option>

              {stops.map((stop)=>(
                <option
                  key={stop.id}
                  value={stop.id}
                >
                  {stop.name}
                </option>
              ))}

            </select>

          </label>

        </div>

        <div className="route-arrow">
          <ArrowDown size={20}/>
        </div>

        <div className="stop-field">

          <div className="stop-icon end">
            <MapPin size={18}/>
          </div>

          <label className="field-label">

            Destination

            <select
              id="destination-stop-select"
              value={destinationStop}
              onChange={(e)=>onDestinationChange(e.target.value)}
            >
              <option value="">
                Choose your destination
              </option>

              {stops.map((stop)=>(
                <option
                  key={stop.id}
                  value={stop.id}
                >
                  {stop.name}
                </option>
              ))}

            </select>

          </label>

        </div>

      </div>

      <button
        className="primary-button search-button"
        disabled={loading}
        aria-busy={loading}
        type="button"
        onClick={onSearch}
      >

        {loading ? <><LoaderCircle className="search-button__spinner" size={19} aria-hidden="true" />Searching routes…</> : <>Find buses<ArrowRight size={19}/></>}

      </button>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

    </section>
  );
}
