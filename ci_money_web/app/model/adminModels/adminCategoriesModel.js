const adminCategoriesModelObject = {};

adminCategoriesModelObject.getCategoriesQuery = () => {
  return `select * from public.cim_categories`;
};

adminCategoriesModelObject.addNewCategoryQuery = (
  name,
  desc,
  img,
  sequence,
  status,
  created_by = 2
) => {
  return `
    INSERT INTO public.cim_categories (cat_name,cat_desc,cat_img,cat_sequence,cat_status,cat_created_by,cat_updated_at)
    VALUES ('${name}','${desc}','${img}',${+sequence},${
    status === "true" ? true : false
  },${+created_by},now()) returning *;
    `;
};

adminCategoriesModelObject.editExistingCategoryQuery = (
  id,
  newName,
  newDesc,
  newSequence,
  newStatus,
  newImage
) => {
  if (newImage) {
    return `UPDATE public.cim_categories
        SET cat_name='${newName}',cat_desc='${newDesc}',cat_sequence='${newSequence}',cat_status='${newStatus}',cat_img='${newImage}',cat_updated_at=now()
        WHERE cat_id=${id}
        `;
  }
  return `
    UPDATE public.cim_categories
    SET cat_name='${newName}',cat_desc='${newDesc}',cat_sequence='${newSequence}',cat_status='${newStatus}',cat_updated_at=now()
    WHERE cat_id=${id}
    `;
};

adminCategoriesModelObject.getSingleCategoryQuery = (id) => {
  return `
    SELECT * FROM public.cim_categories as cat
    WHERE cat.cat_id = ${id}; 
    `;
};

module.exports = adminCategoriesModelObject;
