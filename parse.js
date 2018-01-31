const Nightmare = require('nightmare');
const debug = require('debug')('airbnb:parse');

const nightmare = Nightmare();

const parseProductPage = () => {
  const rawJSONinHTML = document.querySelector('script[data-hypernova-key="spaspabundlejs"]')
    .innerHTML;

  const rawJSON = rawJSONinHTML.replace('<!--', '').replace('-->', '');
  const json = JSON.parse(rawJSON);

  const $rd = json.bootstrapData.reduxData.marketplacePdp.listingInfo.listing;

  return {
    id: $rd.id,
    name: $rd.name,
    images: $rd.photos.map(photo => ({
      id: photo.id,
      picture: photo.picture.replace('?aki_policy=large', ''),
      isProfessional: photo.is_professional,
      scrimColor: photo.scrim_color,
      caption: photo.caption,
    })),
    guestsCount: $rd.person_capacity,
    kind: $rd.room_type_category,
    lat: $rd.lat,
    lng: $rd.lng,
    reviewsCount: $rd.visible_review_count,
    isSuperhost: $rd.primary_host.is_superhost,
    rating: $rd.star_rating,
    price: $rd.p3_event_data_logging.price,
    bedsCount: $rd.listing_rooms
      .reduce((bedsCount, { beds }) => bedsCount + beds
        .reduce((subBedsCount, subBeds) => subBedsCount + subBeds.quantity, 0), 0),
  };
};

nightmare
  .goto('https://www.airbnb.com/s/homes')
  .evaluate(() => {
    const links = [...document.querySelectorAll('[itemprop=itemListElement]')].map(item =>
      item.querySelectorAll("[itemprop='url']")[0].getAttribute('content'),
    );

    return { links };
  })
  .end()
  .then(({ links }) => {
    debug('links', links);

    links.forEach((link) => {
      debug('link', link);
      const nn = new Nightmare({ show: true, gotoTimeout: 1000 * 120 });

      nn
        .goto(`https://${link}`)
        .evaluate(parseProductPage)
        .end()
        .then(response => console.log(JSON.stringify(response)))
        .catch(e => console.error(e));
    });
  })
  .catch(err => console.log('err', err));
