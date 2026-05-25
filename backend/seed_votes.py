import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'voting.db')

def seed_votes(total_votes=21):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # get candidate ids
    cur.execute("SELECT id, name FROM candidates")
    rows = cur.fetchall()
    candidates = {name: cid for cid, name in rows}

    if 'Arjun Sharma' not in candidates:
        print('Arjun Sharma not found in candidates. Run seed_data first.')
        return

    arjun_id = candidates['Arjun Sharma']
    other_ids = [cid for name, cid in [(n, candidates[n]) for n in candidates] if cid != arjun_id]
    # fallback: use all other candidates
    other_ids = [cid for cid in candidates.values() if cid != arjun_id]

    arjun_votes = total_votes // 2 + 1
    remaining = total_votes - arjun_votes

    inserts = []
    inserts += [(arjun_id,) for _ in range(arjun_votes)]

    # distribute remaining among others
    if other_ids:
        i = 0
        for _ in range(remaining):
            inserts.append((other_ids[i % len(other_ids)],))
            i += 1

    cur.executemany('INSERT INTO votes (candidate_id) VALUES (?)', inserts)
    conn.commit()
    conn.close()
    print(f'Inserted {len(inserts)} test votes — Arjun has {arjun_votes} votes.')

if __name__ == '__main__':
    seed_votes()
