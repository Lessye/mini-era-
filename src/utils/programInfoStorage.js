const PROGRAM_INFO_KEY = 'miniEraProgramInfo'

const defaultProgramInfo = {
  programName: 'Mini Erasmus 2026',
  city: 'Bratislava',
  country: 'Slovensko',
  startDate: '10.06',
  endDate: '13.06',
  monthLabel: 'JÚN 2026',
  year: '2026',
  programDays: 4,
}

export function getProgramInfo() {
  const savedProgramInfo = localStorage.getItem(PROGRAM_INFO_KEY)

  if (savedProgramInfo) {
    return JSON.parse(savedProgramInfo)
  }

  localStorage.setItem(PROGRAM_INFO_KEY, JSON.stringify(defaultProgramInfo))

  return defaultProgramInfo
}

export function saveProgramInfo(programInfo) {
  localStorage.setItem(PROGRAM_INFO_KEY, JSON.stringify(programInfo))
}

export function resetProgramInfo() {
  localStorage.setItem(PROGRAM_INFO_KEY, JSON.stringify(defaultProgramInfo))

  return defaultProgramInfo
}