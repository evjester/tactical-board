import { Layer } from 'react-konva'
import { usePlayers, useLayersState } from '../../store'
import { PlayerChip } from './PlayerChip'

export function PlayersLayer() {
  const players = usePlayers()
  const layers = useLayersState()

  // Filter players based on layer visibility
  const visiblePlayers = players.filter((player) => {
    if (player.team === 'home') return layers.homePlayers.visible
    if (player.team === 'away') return layers.awayPlayers.visible
    return true
  })

  // Sort players: non-selected first, then selected, so selected are on top
  const sortedPlayers = [...visiblePlayers].sort((a, b) => {
    if (a.isSelected === b.isSelected) return 0
    return a.isSelected ? 1 : -1
  })

  // Determine if a player's layer is locked
  const isPlayerLocked = (team: 'home' | 'away') => {
    return team === 'home' ? layers.homePlayers.locked : layers.awayPlayers.locked
  }

  return (
    <Layer>
      {sortedPlayers.map((player) => (
        <PlayerChip key={player.id} player={player} locked={isPlayerLocked(player.team)} />
      ))}
    </Layer>
  )
}
