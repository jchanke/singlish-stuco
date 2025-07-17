/**
 * Populates schedule with info from
 *  - article headers
 *  - src/data/schedule.json
 *
 * for the /schedules page.
 *
 * Adapted from the website for the Intro to Rust StuCo at CMU, Spring 2025.
 * Source: https://github.com/rust-stuco/rust-stuco.github.io/blob/main/schedule.njk
 */
import type { CollectionEntry } from "astro:content";

interface ScheduleTableProps {
  lessons: Array<CollectionEntry<"lessons">>;
}

const ScheduleTable = ({ lessons }: ScheduleTableProps) => {
  const style = {
    width: "min(200vw, 75vw)",
    marginLeft: "50%",
    transform: "translateX(-50%)",
  };

  return (
    <div className="schedule-container" style={style}>
      <table>
        <thead>
          <tr className="font-semibold italic font-display text-lg">
            <th>Objectives</th>
            <th>Lesson</th>
            <th>Slides</th>
            <th>Homework</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((lesson, index) => {
            const frontmatter = lesson.data;
            return (
              <tr key={lesson.id}>
                {/* objectives */}
                <td>
                  <h2 className="mt-0 mb-2 italic font-bold">
                    {frontmatter.title}
                  </h2>
                  <a href="#/" id={`toggleButton${index}`}>
                    Details ▼
                  </a>
                  <div id={`toggleDiv${index}`} style={{ display: "none" }}>
                    <ul>
                      {frontmatter.objectives.map((objective) => (
                        <li key={objective}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                </td>
                {/* lesson */}
                <td style={{ whiteSpace: "nowrap" }}>
                  <a href={`/lessons/${lesson.id}`}>
                    lesson {frontmatter.week}
                  </a>
                </td>
                {/* slides */}
                <td style={{ whiteSpace: "nowrap" }}>
                  {frontmatter.details_released && (
                    <a href={frontmatter.slides}>week {frontmatter.week}</a>
                  )}
                </td>
                {/* homework */}
                <td style={{ whiteSpace: "nowrap" }}>
                  {frontmatter.details_released && (
                    <a href={frontmatter.hw}>week {frontmatter.week}</a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;

// <style>
//     /* Container for scrolling on mobile */
//     .schedule-container {
//         width: 100%;
//         overflow-x: auto;
//     }
//
//     /* Table base styles */
//     .schedule-container table {
//         border-collapse: collapse;
//         margin: 0 auto;
//     }
//
//     .schedule-container th,
//     .schedule-container td {
//         padding: 10px 16px;
//         text-align: left;
//         vertical-align: top;
//     }
//
//     /* Desktop view - wide table */
//     @media (min-width: 768px) {
//         .schedule-container table {
//             width: 90%;
//             max-width: 1400px; /* Make the table significantly wider */
//         }
//
//         /* Column widths for desktop */
//         .schedule-container th:first-child,
//         .schedule-container td:first-child {
//             width: 35%;
//         }
//
//         .schedule-container th:nth-child(2),
//         .schedule-container td:nth-child(2) {
//             width: 35%;
//         }
//
//         .schedule-container th:nth-child(3),
//         .schedule-container td:nth-child(3),
//         .schedule-container th:nth-child(4),
//         .schedule-container td:nth-child(4) {
//             width: 15%;
//         }
//     }
//
//     /* Mobile view - horizontal scrolling */
//     @media (max-width: 767px) {
//         .schedule-container {
//             overflow-x: scroll;
//             -webkit-overflow-scrolling: touch;
//         }
//
//         .schedule-container table {
//             min-width: 800px; /* Ensures table maintains width on mobile */
//         }
//
//         .schedule-container th,
//         .schedule-container td {
//             font-size: 0.9rem;
//         }
//
//         .schedule-container ul {
//             padding-left: 1rem;
//         }
//     }
// </style>
