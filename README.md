# automaton-notitg-glue

A glue program that connects between Automaton WebSocket and NotITG memory

### How to Use

```sh
yarn
node . -a 0x897d10 -p 12250
```

### memories - DJ TAKA

- `0`: left untouched
- `1`: left untouched
- `2`: N>A integer part of `time`
- `3`: N>A fractional part of `time`, in microsecond
  - I'm just too lazy to do actual int -> float conversion, forgive me

Code like this:

```lua
-- in update loop
automaton:update( time )

local floorTime = math.floor( time )
local fracTime = time - floorTime

GAMESTATE:SetExternal( 2, floorTime )
GAMESTATE:SetExternal( 3, math.floor( 1E6 * fracTime ) )
```

### Shoutouts

to Jaezmien, I've referenced their code a lot

[Jaezmien/NotITG-External](https://github.com/Jaezmien/NotITG-External)
