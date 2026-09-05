App based on my 2DGameEngine i've built in JAVA for my ZHAW project.

[https://github.com/LucasCGG/GameEngine2D]

# Rouge Like

[x] Movement + one room. Game loop, a player you move with WASD, walls you collide with.

[x] Combat against one enemy. An enemy that just moves toward you (trivial AI — take vector to the player, normalize it, move along it). You attack (melee hitbox or projectiles), it has HP and dies, you have HP and can die.

[x]A full room of enemies with a clear condition. Spawn several, open a door when they're all dead.

[x] Multiple rooms as a level — but hardcoded first. Get room-to-room transitions working on a fixed map before you generate anything.

[ ] Produce generation of the layout.

[ ] Upgrades / rewards after clearing rooms

[ ] A boss with a couple of attack phases.

[ ] Screen shake, hit flashes, particles, sound.

[ ] World editor, for predefined worlds like tutorial or entrance etc etc...

## Weapons

### Swords {speed(slow | mid | fast), damage(low | mid | high), reach(tiny, mid, long)}

Dagger (fast, low, tiny)
Sword (mid, mid, mid)
Greatsword (slow, high, mid)
Rapier (fast, low, long)
Spear (medium, mid, long)

### Guns {speed(slow | mid | fast), damage(low | mid | high), accuracy(bad | mid | good), reach(tiny, mid, long)}
Pistol (mid, mid, mid, mid)
Rifle (fast, mid, good, mid)
Shotgun (slow, high, bad, tiny)
Bow (mid, high, mid, mid)
Crossbow (slow, high, high, mid)
SMG (fast, low, low, mid)
Sniper(slow, high, good, long)
Hand Cannon (slow, high, mid, high)

### Miscelenious {speed(slow | mid | fast), damage(low | mid | high), accuracy(bad | mid | good), reach(tiny, mid, long)}
Fire Staff(mid, mid, good, long) damage over time (fire)
Frost Wand(mid, mid, good, long) slows enemy

