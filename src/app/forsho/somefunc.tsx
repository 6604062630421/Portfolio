import { useEffect, useRef ,useState,useMemo} from 'react'
import { Swapy,SlotItemMapArray,utils } from 'swapy'
import { createSwapy } from 'swapy'
import './style.css'
type Item = {
  id: string
  title: string
}
const initialItems: Item[] = [
  { id: '1', title: 'a' },
  { id: '3', title: 'b' },
  { id: '2', title: 'c' },
]

let id = 4
function Test() {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMapArray>(utils.initSlotItemMap(items, 'id'))
  const slottedItems = useMemo(() => utils.toSlottedItems(items, 'id', slotItemMap), [items, slotItemMap])
  const swapyRef = useRef<Swapy | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => utils.dynamicSwapy(swapyRef.current, items, 'id', slotItemMap, setSlotItemMap), [items])

  useEffect(() => {
    swapyRef.current = createSwapy(containerRef.current!, {
      manualSwap: true,
      // animation: 'dynamic'
      // autoScrollOnDrag: true,
      // swapMode: 'drop',
      // enabled: true,
      // dragAxis: 'x',
      // dragOnHold: true
    })

    swapyRef.current.onSwap((event) => {
      setSlotItemMap(event.newSlotItemMap.asArray)
    })

    return () => {
      swapyRef.current?.destroy()
    }
  }, [])
  return (
    <div className="container" ref={containerRef}>
      <div className="items bg-fuchsia-200">
        {slottedItems.sort((a,b)=>a.slotId.localeCompare(b.slotId)).map(({ slotId, itemId, item }) => (
          <div className="slot" key={slotId} data-swapy-slot={slotId}>
            {item &&
              <div className="item cursor-grab active:cursor-grabbing" data-swapy-item={itemId} key={itemId}>
                <span>{item.title}+{slotId}+{itemId}+{item.id}</span>
                <span className="delete" data-swapy-no-drag onClick={() => {
                  setItems(items.filter(i => i.id !== item.id))
                  id--;
                }}></span>
              </div>
            }
          </div>
        ))}
      </div>
      <div className="item item--add" onClick={() => {
        const newItem: Item = { id: `${id}`, title: `${id}` }
        setItems([...items, newItem])
        id++
      }}>+</div>
    </div>
  )
}

export default Test